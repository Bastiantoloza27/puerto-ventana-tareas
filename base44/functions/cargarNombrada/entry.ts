import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { leerNombradaPdf, aplicarNombrada } from '../../shared/nombrada.ts';

// Carga manual de la nombrada en PDF (subida por la Jefatura desde Programación).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Solo la Jefatura puede cargar la nombrada.' }, { status: 403 });

    const { file_uri } = await req.json().catch(() => ({}));
    if (!file_uri || typeof file_uri !== 'string') return Response.json({ error: 'Falta el archivo PDF.' }, { status: 400 });

    const sr = base44.asServiceRole;
    const { signed_url } = await sr.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 600 });
    const { fecha, turnos } = await leerNombradaPdf(sr, signed_url);
    if (!fecha || !turnos.some((t) => t.faenas.length)) return Response.json({ error: 'No se reconoció una nombrada en el PDF (fecha o faenas).' }, { status: 422 });

    const turnosRes = await aplicarNombrada(sr, { fecha, turnos, asunto: 'Nombrada (PDF cargado)', remitente: user.email, origen: 'cargado por ' + (user.full_name || user.email) });
    return Response.json({ fecha, turnos: turnosRes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}