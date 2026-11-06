import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { SH, enviarPrograma, inicioTurno, horaInicio } from '../../shared/programaMail.ts';

const horaCL = () => new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());

// Envía la programación al asesor. Con programar=true, si el turno aún no comienza, deja el envío agendado para su hora de inicio.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { programacion_id, programar } = await req.json().catch(() => ({}));
    if (!programacion_id || typeof programacion_id !== 'string') return Response.json({ error: 'programacion_id requerido' }, { status: 400 });

    const plan = await base44.entities.Programacion.get(programacion_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!plan) return Response.json({ error: 'Programación no encontrada' }, { status: 404 });
    if (!SH[plan.turno]) return Response.json({ error: 'Turno inválido' }, { status: 400 });
    if (!(plan.actividad_ids || []).length) return Response.json({ error: 'La programación no tiene actividades asignadas' }, { status: 400 });

    const inicio = inicioTurno(plan.fecha, plan.turno);
    if (programar && inicio > new Date()) {
      await base44.entities.Programacion.update(plan.id, { envio_hora: inicio.toISOString(), envio_estado: 'pendiente', envio_cc: user.email });
      return Response.json({ ok: true, programado: true, hora: horaInicio(plan.turno) });
    }

    const r = await enviarPrograma(base44, plan, user.email);
    if (!r.sent.length) return Response.json({ error: 'No se pudo enviar el correo a ningún destinatario' }, { status: 502 });
    await base44.entities.Programacion.update(plan.id, {
      envio_estado: 'enviado',
      bitacora: [...(plan.bitacora || []), { hora: horaCL(), texto: `Correo de tareas enviado a ${r.sent.join(', ')}` }],
    });
    return Response.json({ ok: true, sent: r.sent, asesor_email: r.asesorEmail, asesor_ok: r.asesor_ok });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}