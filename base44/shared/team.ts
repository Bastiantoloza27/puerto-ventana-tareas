// Busca el correo de un asesor en el equipo registrado (Integrante), tolerando orden de nombres y tildes.
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/\s+/).filter(Boolean);

export async function emailDeAsesor(base44, nombre) {
  if (!nombre) return null;
  const tk = norm(nombre);
  const team = await base44.asServiceRole.entities.Integrante.list();
  return team.find((i) => norm(i.nombre).filter((t) => tk.includes(t)).length >= 2)?.email || null;
}