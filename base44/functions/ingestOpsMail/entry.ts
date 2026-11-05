import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { parseNombrada } from '../../shared/opsMail.ts';

async function graphRequest(accessToken, path) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Graph error: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function stripHtml(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

const hoySantiago = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
const horaSantiago = () => new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit' }).format(new Date());

// Recibe la notificación de Outlook, lee el correo y lo carga en la programación del turno.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { data } = await req.json().catch(() => ({}));
    const notas = data?.value;
    if (!Array.isArray(notas) || !notas.length) return Response.json({ error: 'Sin notificaciones' }, { status: 400 });

    const sr = base44.asServiceRole;
    const { accessToken } = await sr.connectors.getConnection('outlook');
    const fecha = hoySantiago();
    const hora = horaSantiago();

    const abiertos = await sr.entities.Programacion.filter({ fecha, estado: { $ne: 'cerrada' } }, { sort: 'turno', limit: 10 });
    const planes = abiertos.items || [];
    const equipo = await sr.entities.Integrante.filter({ perfil: 'asesor' });
    const nombres = [...new Set([
      ...planes.map((p) => p.asesor).filter(Boolean),
      ...equipo.map((i) => i.nombre).filter(Boolean),
    ])];

    const resultados = [];
    for (const nota of notas.slice(0, 5)) {
      if (nota?.changeType && nota.changeType !== 'created') continue;
      const messageId = nota?.resourceData?.id;
      if (!messageId) continue;

      const previos = await sr.entities.CorreoOperacion.filter({ message_id: messageId }, { limit: 1 });
      if ((previos.items || []).length) { resultados.push({ messageId, estado: 'duplicado' }); continue; }

      const msg = await graphRequest(accessToken, `/me/messages/${encodeURIComponent(messageId)}?$select=subject,from,receivedDateTime,body`);
      const cuerpo = msg?.body?.contentType === 'html' ? stripHtml(msg.body.content || '') : String(msg?.body?.content || '');
      const texto = cuerpo.slice(0, 8000);
      if (texto.length < 20) { resultados.push({ messageId, estado: 'ignorado' }); continue; }

      const parsed = await parseNombrada(base44, { texto, nombres });
      const candidatos = parsed.asesor ? planes.filter((p) => p.asesor === parsed.asesor) : planes;
      const plan = candidatos.length === 1 ? candidatos[0] : null;

      const registro = await sr.entities.CorreoOperacion.create({
        message_id: messageId,
        asunto: msg?.subject || parsed.asunto,
        remitente: msg?.from?.emailAddress?.address || '',
        recibido: msg?.receivedDateTime || new Date().toISOString(),
        fecha,
        asesor: parsed.asesor || '',
        lineas: parsed.lineas,
        texto: texto.slice(0, 4000),
        estado: plan ? 'aplicado' : 'pendiente',
        programacion_id: plan?.id || '',
      });

      if (!plan) { resultados.push({ messageId, estado: 'pendiente' }); continue; }

      const prev = plan.correo;
      const correo = prev
        ? { ...prev, lineas: [...(prev.lineas || []), ...parsed.lineas], actualizacion: { hora, texto: texto.slice(0, 1000), actividad_id: parsed.lineas.find((l) => l.actividad_id)?.actividad_id || '' } }
        : { asunto: registro.asunto, hora, lineas: parsed.lineas };
      const nuevas = parsed.lineas.map((l) => l.actividad_id).filter(Boolean);
      const ids = [...new Set([...(plan.actividad_ids || []), ...nuevas])];
      await sr.entities.Programacion.update(plan.id, {
        correo,
        actividad_ids: ids,
        asesor: plan.asesor || parsed.asesor || '',
        bitacora: [...(plan.bitacora || []), { hora, texto: `Correo de Operaciones recibido automáticamente · ${nuevas.length} sugeridas` }],
      });
      resultados.push({ messageId, estado: 'aplicado', programacion_id: plan.id });
    }

    return Response.json({ fecha, procesados: resultados });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}