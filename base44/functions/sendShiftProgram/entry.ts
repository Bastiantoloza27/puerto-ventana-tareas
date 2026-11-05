import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { emailDeAsesor } from '../../shared/team.ts';

const SH = { T1: '1° turno', T2: '2° turno', T3: '3° turno' };
const TL = { t: 'Transversal', o: 'Según operación', c: 'Según ocurrencia' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Envía la programación del turno al asesor asignado, con copia a quien la envía.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { programacion_id } = await req.json().catch(() => ({}));
    if (!programacion_id || typeof programacion_id !== 'string') return Response.json({ error: 'programacion_id requerido' }, { status: 400 });

    const plan = await base44.entities.Programacion.get(programacion_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!plan) return Response.json({ error: 'Programación no encontrada' }, { status: 404 });
    if (!SH[plan.turno]) return Response.json({ error: 'Turno inválido' }, { status: 400 });
    const ids = plan.actividad_ids || [];
    if (!ids.length) return Response.json({ error: 'La programación no tiene actividades asignadas' }, { status: 400 });

    const cat = await base44.entities.Actividad.filter({ id: { $in: ids } }, { limit: 100 });
    const M = Object.fromEntries(cat.items.map((a) => [a.id, a]));
    const td = 'style="border-bottom:1px solid #e3e7e7;padding:6px 4px;font-size:12px;vertical-align:top"';
    const rows = ids.map((id) => M[id]).filter(Boolean)
      .map((a, i) => `<tr><td ${td}>${i + 1}</td><td ${td}>${esc(a.area)} · ${esc(a.sitio)}</td><td ${td}><b>${esc(a.proceso)}</b><br>${esc(a.descripcion || '')}</td><td ${td}>${TL[a.tipo] || ''}</td></tr>`)
      .join('');

    const html = `<div style="font-family:Arial,sans-serif;color:#1c2526;max-width:680px;margin:auto">
<div style="background:#16386a;color:#fff;padding:18px 22px;border-radius:4px 4px 0 0"><b>Programa APR · Puerto Ventanas S.A.</b></div>
<div style="background:#fff;border:1px solid #dde5e4;padding:22px">
<h2 style="font-family:Georgia,serif;font-weight:400;margin:0 0 4px">Tareas asignadas · ${esc(SH[plan.turno])}</h2>
<p style="color:#6b7778;margin:0 0 16px">${esc(plan.fecha)} · Asesor de turno: <b>${esc(plan.asesor || '—')}</b> · ${ids.length} actividades</p>
<table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;color:#555;font-size:11px">N°</th><th style="text-align:left;color:#555;font-size:11px">Área / sitio</th><th style="text-align:left;color:#555;font-size:11px">Actividad</th><th style="text-align:left;color:#555;font-size:11px">Tipo</th></tr>${rows}</table>
<p style="margin:18px 0 0"><a href="https://pvsatareas.cl/turno" style="background:#2a64b8;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:13px">Abrir mi turno</a></p>
</div></div>`;

    const asesorEmail = await emailDeAsesor(base44, plan.asesor);
    const to = [...new Set([asesorEmail, user.email].filter(Boolean))];
    const subject = `Tareas asignadas · ${SH[plan.turno]} · ${String(plan.fecha ?? '').slice(0, 10)}`;
    const results = await Promise.allSettled(to.map((email) => base44.asServiceRole.integrations.Core.SendEmail({ to: email, from_name: 'Programa APR', subject, body: html, category: 'transactional' })));
    const sent = to.filter((_, i) => results[i].status === 'fulfilled' && results[i].value?.success !== false);
    if (!sent.length) return Response.json({ error: 'No se pudo enviar el correo a ningún destinatario' }, { status: 502 });
    return Response.json({ ok: true, sent, asesor_email: asesorEmail, asesor_ok: !!asesorEmail && sent.includes(asesorEmail) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}