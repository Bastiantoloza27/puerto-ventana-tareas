import { emailDeAsesor } from './team.ts';

export const SH = { T1: '1° turno', T2: '2° turno', T3: '3° turno' };
const INICIO = { T1: [8, 0], T2: [15, 30], T3: [23, 0] };
const TL = { t: 'Transversal', o: 'Según operación', c: 'Según ocurrencia' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Instante (UTC) en que comienza el turno, hora de Santiago.
export function inicioTurno(fecha, turno) {
  const [y, m, d] = String(fecha).slice(0, 10).split('-').map(Number);
  const [h, mi] = INICIO[turno];
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(guess)).map((x) => [x.type, x.value]));
  const offset = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - guess;
  return new Date(guess - offset);
}

export const horaInicio = (turno) => INICIO[turno].map((n) => String(n).padStart(2, '0')).join(':');

// Envía la programación al asesor asignado (y copia a cc).
export async function enviarPrograma(base44, plan, cc) {
  const ids = plan.actividad_ids || [];
  const cat = await base44.asServiceRole.entities.Actividad.filter({ id: { $in: ids } }, { limit: 200 });
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
  const to = [...new Set([asesorEmail, cc].filter(Boolean))];
  const subject = `Tareas asignadas · ${SH[plan.turno]} · ${String(plan.fecha ?? '').slice(0, 10)}`;
  const results = await Promise.allSettled(to.map((email) => base44.asServiceRole.integrations.Core.SendEmail({ to: email, from_name: 'Programa APR', subject, body: html, category: 'transactional' })));
  const sent = to.filter((_, i) => results[i].status === 'fulfilled' && results[i].value?.success !== false);
  return { sent, asesorEmail, asesor_ok: !!asesorEmail && sent.includes(asesorEmail) };
}