import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { parseNombrada, detectarTurno, agregarEnvio } from '../../shared/opsMail.ts';
import { leerNombradaPdf, aplicarNombrada } from '../../shared/nombrada.ts';

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
const horaSantiago = (d = new Date()) => new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit' }).format(d);

// Recibe la notificación de Outlook, lee el correo y lo carga en la programación del turno.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { data, revisar } = await req.json().catch(() => ({}));
    const sr = base44.asServiceRole;
    const { accessToken } = await sr.connectors.getConnection('outlook');

    // Revisión manual: toma los últimos correos del buzón (últimas 36 h) como si hubieran llegado por notificación.
    let notas = data?.value;
    if (revisar) {
      const desde = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
      const lista = await graphRequest(accessToken, `/me/mailFolders/inbox/messages?$select=id&$top=10&$orderby=receivedDateTime desc&$filter=${encodeURIComponent(`receivedDateTime ge ${desde}`)}`);
      notas = (lista?.value || []).map((m) => ({ changeType: 'created', resourceData: { id: m.id } }));
      if (!notas.length) return Response.json({ procesados: [] });
    }
    if (!Array.isArray(notas) || !notas.length) return Response.json({ error: 'Sin notificaciones' }, { status: 400 });
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
    for (const nota of notas.slice(0, 10)) {
      if (nota?.changeType && nota.changeType !== 'created') continue;
      const messageId = nota?.resourceData?.id;
      if (!messageId) continue;

      const previos = await sr.entities.CorreoOperacion.filter({ message_id: messageId }, { limit: 1 });
      if ((previos.items || []).length) { resultados.push({ messageId, estado: 'duplicado' }); continue; }

      const msg = await graphRequest(accessToken, `/me/messages/${encodeURIComponent(messageId)}?$select=subject,from,receivedDateTime,body,hasAttachments`);
      const remitente = String(msg?.from?.emailAddress?.address || '').toLowerCase();

      // Nombrada en PDF adjunto: trae los 3 turnos del día.
      if (msg?.hasAttachments) {
        const adj = await graphRequest(accessToken, `/me/messages/${encodeURIComponent(messageId)}/attachments`);
        const pdf = (adj?.value || []).find((a) => a.contentBytes && (/pdf/i.test(a.contentType || '') || /\.pdf$/i.test(a.name || '')));
        if (pdf) {
          const bytes = Uint8Array.from(atob(pdf.contentBytes), (c) => c.charCodeAt(0));
          const { file_uri } = await sr.integrations.Core.UploadPrivateFile({ file: new File([bytes], pdf.name || 'nombrada.pdf', { type: 'application/pdf' }) });
          const { signed_url } = await sr.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 600 });
          const nom = await leerNombradaPdf(sr, signed_url);
          const recibidoPdf = msg?.receivedDateTime || new Date().toISOString();
          const fechaNom = nom.fecha || fecha;
          const aplicados = nom.turnos.some((t) => t.faenas.length)
            ? await aplicarNombrada(sr, { fecha: fechaNom, turnos: nom.turnos, asunto: msg?.subject, remitente, origen: 'correo' })
            : [];
          await sr.entities.CorreoOperacion.create({
            message_id: messageId, asunto: msg?.subject || 'Nombrada', remitente, recibido: recibidoPdf, fecha: fechaNom, turno: '',
            lineas: nom.turnos.flatMap((t) => t.faenas.map((f) => ({ texto: `${t.turno} · ${f.faena} · Sitio ${f.sitio} · ${f.dotacion} pers.`, actividad_id: '' }))).slice(0, 60),
            texto: `Nombrada PDF: ${pdf.name || ''}`,
            estado: aplicados.some((a) => a.estado === 'aplicado') ? 'aplicado' : 'pendiente',
          });
          resultados.push({ messageId, estado: 'nombrada_pdf', fecha: fechaNom, turnos: aplicados });
          continue;
        }
      }

      const cuerpo = msg?.body?.contentType === 'html' ? stripHtml(msg.body.content || '') : String(msg?.body?.content || '');
      const texto = cuerpo.slice(0, 8000);
      if (texto.length < 20) { resultados.push({ messageId, estado: 'ignorado' }); continue; }

      const parsed = await parseNombrada(base44, { texto, nombres });
      const asunto = msg?.subject || parsed.asunto;
      const turno = detectarTurno(asunto) || detectarTurno(texto.slice(0, 400));
      const candidatos = turno ? planes.filter((p) => p.turno === turno) : parsed.asesor ? planes.filter((p) => p.asesor === parsed.asesor) : planes;
      const plan = candidatos.length === 1 ? candidatos[0] : null;
      const recibido = msg?.receivedDateTime || new Date().toISOString();
      const horaCorreo = horaSantiago(new Date(recibido));

      const registro = await sr.entities.CorreoOperacion.create({
        message_id: messageId,
        asunto,
        remitente,
        recibido,
        fecha,
        turno: turno || '',
        asesor: parsed.asesor || '',
        lineas: parsed.lineas,
        texto: texto.slice(0, 4000),
        estado: plan ? 'aplicado' : 'pendiente',
        programacion_id: plan?.id || '',
      });

      if (!plan) { resultados.push({ messageId, estado: 'pendiente' }); continue; }

      const correo = agregarEnvio(plan.correo, { asunto: registro.asunto, hora: horaCorreo, remitente, lineas: parsed.lineas });
      const n = correo.envios.length;
      const etiqueta = n === 1 ? 'Nombrada' : `Actualización ${n - 1}`;
      const nuevas = parsed.lineas.map((l) => l.actividad_id).filter(Boolean);
      const ids = [...new Set([...(plan.actividad_ids || []), ...nuevas])];
      await sr.entities.Programacion.update(plan.id, {
        correo,
        actividad_ids: ids,
        asesor: plan.asesor || parsed.asesor || '',
        bitacora: [...(plan.bitacora || []), { hora, texto: `${etiqueta} de Operaciones (${horaCorreo}) recibida automáticamente · ${nuevas.length} sugeridas` }],
      });
      resultados.push({ messageId, estado: 'aplicado', programacion_id: plan.id });
    }

    return Response.json({ fecha, procesados: resultados });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}