import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { enviarPrograma } from '../../shared/programaMail.ts';

const horaCL = () => new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());

// Envía a la hora de inicio del turno los correos de tareas que quedaron agendados al publicar.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sr = base44.asServiceRole;
    const { items } = await sr.entities.Programacion.filter({ estado: 'publicada', envio_estado: 'pendiente', envio_hora: { $lte: new Date().toISOString() } }, { limit: 10 });
    const out = [];
    for (const plan of items) {
      const r = await enviarPrograma(base44, plan, plan.envio_cc);
      const ok = r.sent.length > 0;
      await sr.entities.Programacion.update(plan.id, {
        envio_estado: ok ? 'enviado' : 'error',
        bitacora: [...(plan.bitacora || []), { hora: horaCL(), texto: ok ? `Correo de tareas enviado al inicio del turno a ${r.sent.join(', ')}` : 'No se pudo enviar el correo de tareas al inicio del turno' }],
      });
      out.push({ id: plan.id, turno: plan.turno, sent: r.sent });
    }
    return Response.json({ enviados: out });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}