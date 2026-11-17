import { base44 } from "@/api/base44Client";
import { now } from "@/lib/apr";

export const PUESTOS = [
  ["Vigilante Privado Turno", "Vigilante de turno"],
  ["Vigilante Privado - Sala CCTV", "Sala CCTV"],
  ["Porteria Principal", "Portería principal"],
  ["Acceso Muelle", "Acceso muelle"],
  ["Terminal Granos/Petcoke", "Terminal Granos / Petcoke"],
  ["Control ACP", "Control ACP"],
];
export const corto = (p) => PUESTOS.find(([k]) => k === p)?.[1] || p;
export const GRUPOS = [["inicio", "Al empezar el turno"], ["durante", "Durante el turno"], ["final", "Al terminar el turno"], ["mes", "Una vez al mes"]];

// Tareas del puesto en el turno: el ajuste de Jefatura manda; si no hay, la matriz.
export function tareasPuesto(v, turno, puesto) {
  const aj = v.ajustes.find((a) => a.puesto === puesto);
  const base = aj
    ? (aj.tarea_ids || []).map((id) => v.matriz.find((t) => t.id === id)).filter(Boolean)
    : v.matriz.filter((t) => t.puesto === puesto && t.activa !== false && (t.turnos || []).includes(turno));
  return base.map((t) => ({
    t,
    reg: v.regs.find((r) => r.tarea_id === t.id && r.puesto === puesto) || (t.grupo === "mes" ? v.mes.find((r) => r.tarea_id === t.id) : null),
  }));
}

export function avance(items) {
  const ok = items.filter((i) => i.reg?.estado === "ok").length;
  const no = items.filter((i) => i.reg?.estado === "no").length;
  return { total: items.length, ok, no, pend: items.length - ok - no, pct: items.length ? Math.round((ok / items.length) * 100) : 0 };
}

export function marcar({ reg, t, fecha, turno, puesto, vigilante }, data) {
  if (reg && reg.fecha === fecha && reg.turno === turno) return base44.entities.RegistroVigilante.update(reg.id, { ...data, hora: now() });
  return base44.entities.RegistroVigilante.create({ fecha, turno, puesto, tarea_id: t.id, mensual: t.grupo === "mes", vigilante, hora: now(), ...data });
}