import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SH = { T1: '1° turno', T2: '2° turno', T3: '3° turno' };
const ST = { ok: 'Ejecutado', no: 'No ejecutado', na: 'No ocurrió' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { programacion_id } = await req.json();
    if (!programacion_id || typeof programacion_id !== 'string') return Response.json({ error: 'programacion_id requerido' }, { status: 400 });

    const plan = await base44.entities.Programacion.get(programacion_id);
    if (!plan || plan.estado !== 'cerrada') return Response.json({ error: 'Turno no cerrado' }, { status: 400 });
    if (!SH[plan.turno]) return Response.json({ error: 'Turno inválido' }, { status: 400 });
    const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const ids = plan.actividad_ids || [];
    const [cat, ex, nv] = await Promise.all([
      base44.entities.Actividad.filter({ id: { $in: ids } }, { limit: 100 }),
      base44.entities.Ejecucion.filter({ programacion_id }, { limit: 200 }),
      base44.entities.Novedad.filter({ programacion_id }, { limit: 100 }),
    ]);
    const E = Object.fromEntries(ex.items.map((e) => [e.actividad_id, e]));
    const td = 'style="border-bottom:1px solid #e3e7e7;padding:6px 4px;font-size:12px;vertical-align:top"';
    const rows = cat.items.map((a) => { const e = E[a.id] || {}; return `<tr><td ${td}>${esc(a.proceso)} · ${esc(a.sitio)}</td><td ${td}>${ST[e.estado] || '—'}</td><td ${td}>${esc([e.motivo, e.observaciones].filter(Boolean).join(' · '))}</td></tr>`; }).join('');
    const novs = nv.items.map((n) => `<tr><td ${td}>${esc(n.hora)}</td><td ${td}>${esc(n.lugar)} · ${esc(n.tipo)} · ${esc(n.criticidad)}</td><td ${td}>${esc(n.descripcion)}</td></tr>`).join('') || `<tr><td ${td} colspan="3">Sin novedades</td></tr>`;

    const html = `<div style="font-family:Arial,sans-serif;color:#1c2526;max-width:640px;margin:auto">
<div style="background:#0e2a2b;color:#fff;padding:18px 22px;border-radius:4px 4px 0 0"><b>Programa APR · Puerto Ventanas S.A.</b></div>
<div style="background:#fff;border:1px solid #dde5e4;padding:22px">
<h2 style="font-family:Georgia,serif;font-weight:400;margin:0 0 4px">Reporte de cierre · ${SH[plan.turno]}</h2>
<p style="color:#6b7778;margin:0 0 16px">${esc(plan.fecha)} · Asesor ${esc(plan.asesor)} · cerrado ${esc(plan.cerrada_hora)}</p>
<p><b>${num(plan.r_prog)}</b> programadas · <b>${num(plan.r_ok)}</b> ejecutadas · <b>${num(plan.r_no)}</b> no ejecutadas · <b>${num(plan.r_na)}</b> no ocurrió · Cumplimiento <b>${num(plan.r_pct)}%</b></p>
<h3 style="font-size:14px;margin:18px 0 6px">Control de cumplimiento</h3><table style="width:100%;border-collapse:collapse">${rows}</table>
<h3 style="font-size:14px;margin:18px 0 6px">Novedades</h3><table style="width:100%;border-collapse:collapse">${novs}</table>
<h3 style="font-size:14px;margin:18px 0 6px">Entrega al siguiente turno</h3><p style="font-size:13px">${esc(plan.entrega || '—')}</p>
</div></div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'Programa APR',
      subject: `Reporte ${SH[plan.turno]} · ${String(plan.fecha ?? '').slice(0, 10)} · ${num(plan.r_pct)}% cumplimiento`,
      body: html,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}