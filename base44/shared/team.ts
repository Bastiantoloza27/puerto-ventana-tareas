// Busca el correo de un asesor en el equipo registrado (Integrante), tolerando orden de nombres y tildes.
// Elige al integrante con más palabras en común (ej. distingue a Andrés y Ariel Burgos Godoy).
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/\s+/).filter(Boolean);

export async function emailDeAsesor(base44, nombre) {
  if (!nombre) return null;
  const tk = norm(nombre);
  const team = await base44.asServiceRole.entities.Integrante.list();
  let best = null, max = 1;
  for (const i of team) {
    const n = norm(i.nombre).filter((t) => tk.includes(t)).length;
    if (n > max) { max = n; best = i; }
  }
  return best?.email || null;
}