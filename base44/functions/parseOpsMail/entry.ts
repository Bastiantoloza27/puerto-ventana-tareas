import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { texto, asesores } = await req.json().catch(() => ({}));
    if (!texto || typeof texto !== 'string' || !texto.trim()) return Response.json({ error: 'Pega el texto del correo.' }, { status: 400 });
    if (texto.length > 8000) return Response.json({ error: 'El correo es demasiado largo (máx. 8000 caracteres).' }, { status: 400 });
    const nombres = Array.isArray(asesores) ? asesores.filter((a) => typeof a === 'string').slice(0, 50) : [];

    const catalog = await base44.entities.Actividad.list('orden', 500);
    const ids = new Set(catalog.map((c) => c.id));
    const catTxt = catalog.map((c) => `${c.id} | ${c.area} | ${c.sitio} | ${c.proceso} | ${c.descripcion || ''}`).join('\n');

    const prompt = `Eres asistente de la Jefatura de Prevención de Riesgos de un puerto. Recibes el correo de Operaciones con las labores de un turno.
Divide el correo en líneas de labores (ignora saludos, firmas y líneas vacías). Para cada labor, elige la actividad prevencionista del CATÁLOGO que mejor corresponda según sitio y proceso. Usa SOLO ids del catálogo. Si ninguna corresponde claramente, deja actividad_id vacío. No inventes.
Extrae también el asunto (si aparece) y el asesor mencionado, solo si coincide con uno de esta lista: ${nombres.join(', ') || '(ninguno)'}.

CATÁLOGO (id | área | sitio | proceso | descripción):
${catTxt}

CORREO:
"""${texto}"""`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          asunto: { type: 'string' },
          asesor: { type: 'string' },
          lineas: { type: 'array', items: { type: 'object', properties: { texto: { type: 'string' }, actividad_id: { type: 'string' } } } },
        },
      },
    });

    const lineas = (res.lineas || []).slice(0, 60).map((l) => ({ texto: String(l.texto || '').slice(0, 500), actividad_id: ids.has(l.actividad_id) ? l.actividad_id : '' })).filter((l) => l.texto);
    const asesor = nombres.includes(res.asesor) ? res.asesor : null;
    return Response.json({ asunto: String(res.asunto || 'Correo de Operaciones').slice(0, 200), asesor, lineas });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}