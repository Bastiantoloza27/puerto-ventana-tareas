// Interpreta el correo de Operaciones ("nombrada") y lo cruza con el catálogo de actividades.
export async function parseNombrada(base44, { texto, nombres }) {
  const catalog = await base44.asServiceRole.entities.Actividad.list('orden', 500);
  const ids = new Set(catalog.map((c) => c.id));
  const catTxt = catalog.map((c) => `${c.id} | ${c.area} | ${c.sitio} | ${c.proceso} | ${c.descripcion || ''}`).join('\n');
  const lista = (Array.isArray(nombres) ? nombres : []).filter((a) => typeof a === 'string' && a.trim()).slice(0, 50);

  const prompt = `Eres asistente de la Jefatura de Prevención de Riesgos de un puerto. Recibes el correo de Operaciones con las labores de un turno.
Divide el correo en líneas de labores (ignora saludos, firmas y líneas vacías). Para cada labor, elige la actividad prevencionista del CATÁLOGO que mejor corresponda según sitio y proceso. Usa SOLO ids del catálogo. Si ninguna corresponde claramente, deja actividad_id vacío. No inventes.
Extrae también el asunto (si aparece) y el asesor mencionado, solo si coincide exactamente con uno de esta lista: ${lista.join(', ') || '(ninguno)'}.

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

  const lineas = (res.lineas || []).slice(0, 60)
    .map((l) => ({ texto: String(l.texto || '').slice(0, 500), actividad_id: ids.has(l.actividad_id) ? l.actividad_id : '' }))
    .filter((l) => l.texto);
  const asesor = lista.includes(res.asesor) ? res.asesor : null;
  return { asunto: String(res.asunto || 'Correo de Operaciones').slice(0, 200), asesor, lineas };
}