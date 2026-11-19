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

// ¿El usuario es el asesor que Jefatura dejó en el turno? Se acepta por correo guardado, por el equipo registrado
// o porque su nombre/correo coincide con el nombre asignado (ej. mario.gonzalez ↔ González Romero Mario).
export async function esAsesorDelTurno(base44, plan, user) {
  const mail = String(user?.email || '').toLowerCase();
  if (!mail || !plan?.asesor) return false;
  if (String(plan.asesor_email || '').toLowerCase() === mail) return true;
  if ((await emailDeAsesor(base44, plan.asesor))?.toLowerCase() === mail) return true;
  const tk = norm(plan.asesor);
  const propios = [...norm(mail.split('@')[0].replace(/[._-]+/g, ' ')), ...norm(user.full_name)];
  return new Set(propios.filter((t) => t.length > 2 && tk.includes(t))).size >= 2;
}