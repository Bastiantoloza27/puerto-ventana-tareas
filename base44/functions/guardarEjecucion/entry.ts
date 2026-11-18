import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { emailDeAsesor } from '../../shared/team.ts';

// Campos que el asesor puede registrar: resultado, respaldo y datos de ejecución. La planificación queda para Jefatura.
const CAMPOS = ['estado', 'motivo', 'observaciones', 'personas', 'controles', 'evidencias', 'hora'];
const ESTADOS = ['ok', 'no', 'na'];
const txt = (v, n) => String(v ?? '').slice(0, n);

function limpiar(patch) {
  const out = {};
  for (const k of CAMPOS) if (k in (patch || {})) out[k] = patch[k];
  if ('estado' in out && out.estado != null && !ESTADOS.includes(out.estado)) return null;
  if ('motivo' in out) out.motivo = txt(out.motivo, 200);
  if ('observaciones' in out) out.observaciones = txt(out.observaciones, 4000);
  if ('hora' in out) out.hora = txt(out.hora, 20);
  if ('personas' in out && out.personas != null) out.personas = Number(out.personas) || 0;
  if ('controles' in out) out.controles = (Array.isArray(out.controles) ? out.controles : []).slice(0, 10).map((c) => txt(c, 40));
  if ('evidencias' in out) out.evidencias = (Array.isArray(out.evidencias) ? out.evidencias : []).slice(0, 30)
    .map((e) => ({ name: txt(e?.name, 200), uri: txt(e?.uri, 500), is_img: !!e?.is_img }));
  return out;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Debes iniciar sesión' }, { status: 401 });
    const { programacion_id, actividad_id, patch, extra } = await req.json().catch(() => ({}));
    if (!programacion_id || typeof programacion_id !== 'string') return Response.json({ error: 'Falta el turno' }, { status: 400 });

    const svc = base44.asServiceRole.entities;
    const plan = await svc.Programacion.get(programacion_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!plan) return Response.json({ error: 'Turno no encontrado' }, { status: 404 });

    const admin = user.role === 'admin';
    if (!admin) {
      if (user.perfil !== 'asesor') return Response.json({ error: 'Tu perfil no puede registrar actividades' }, { status: 403 });
      const email = await emailDeAsesor(base44, plan.asesor);
      if (!email || email.toLowerCase() !== String(user.email).toLowerCase()) return Response.json({ error: 'Este turno está asignado a otro asesor' }, { status: 403 });
      if (plan.estado !== 'publicada') return Response.json({ error: 'El turno no está abierto para registrar' }, { status: 403 });
    }

    // Actividad extraordinaria agregada desde Mi turno.
    if (extra) {
      const rec = await svc.Ejecucion.create({
        programacion_id, actividad_id: 'extra-' + Date.now(), extra: true, evidencias: [], observaciones: '',
        proceso: txt(extra.proceso, 200), sitio: txt(extra.sitio, 200), descripcion: txt(extra.descripcion, 2000),
      });
      return Response.json({ ok: true, id: rec.id });
    }

    if (!actividad_id || typeof actividad_id !== 'string') return Response.json({ error: 'Falta la actividad' }, { status: 400 });
    const data = limpiar(patch);
    if (!data) return Response.json({ error: 'Estado inválido' }, { status: 400 });

    const existente = (await svc.Ejecucion.filter({ programacion_id, actividad_id }, { limit: 1 })).items[0];
    if (existente) {
      await svc.Ejecucion.update(existente.id, data);
      return Response.json({ ok: true, id: existente.id });
    }
    const planificada = (plan.actividad_ids || []).includes(actividad_id);
    if (!planificada && !admin) return Response.json({ error: 'La actividad no está en la programación del turno' }, { status: 403 });
    const rec = await svc.Ejecucion.create({ programacion_id, actividad_id, evidencias: [], observaciones: '', ...data });
    return Response.json({ ok: true, id: rec.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}