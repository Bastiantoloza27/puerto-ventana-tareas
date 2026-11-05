import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { parseNombrada } from '../../shared/opsMail.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { texto, asesores } = await req.json().catch(() => ({}));
    if (!texto || typeof texto !== 'string' || !texto.trim()) return Response.json({ error: 'Pega el texto del correo.' }, { status: 400 });
    if (texto.length > 8000) return Response.json({ error: 'El correo es demasiado largo (máx. 8000 caracteres).' }, { status: 400 });

    const parsed = await parseNombrada(base44, { texto, nombres: asesores });
    return Response.json(parsed);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}