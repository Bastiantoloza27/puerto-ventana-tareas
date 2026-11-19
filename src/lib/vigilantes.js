import { base44 } from "@/api/base44Client";

// Solo los puestos propios de la empresa; los guardias externos se incorporarán más adelante.
export const PUESTOS = [
  ["Vigilante Privado Turno", "Vigilante de turno"],
  ["Vigilante Privado - Sala CCTV", "Sala CCTV"],
];
export const corto = (p) => PUESTOS.find(([k]) => k === p)?.[1] || p;
export const GRUPOS = [
  ["inicio", "Al empezar el turno", "Tareas fijas de todos los turnos"],
  ["durante", "Durante el turno", "Tareas fijas de todos los turnos"],
  ["final", "Al terminar el turno", "Tareas fijas de todos los turnos"],
  ["mes", "Programadas del mes", "Una vez al mes · hoy le toca a este turno"],
  ["manual", "Asignadas por Jefatura", "Agregadas para este turno"],
];
const TURNOS = ["T1", "T2", "T3"];
const LUM = /luminaria/i;

export const mensuales = (matriz, puesto) => matriz.filter((t) => t.puesto === puesto && t.grupo === "mes" && t.activa !== false);

// Día del mes en que le toca cada tarea mensual a cada turno, repartidas a lo largo del mes.
// Inspección de luminarias solo en el T3 (noche).
export function diaMes(t, turno, lista) {
  const i = lista.findIndex((x) => x.id === t.id);
  if (i < 0) return null;
  const paso = Math.max(3, Math.floor(27 / lista.length));
  if (LUM.test(t.tarea)) return turno === "T3" ? 1 + i * paso + 2 : null;
  return 1 + i * paso + TURNOS.indexOf(turno);
}

// Tareas del puesto en el turno: fijas + mensuales que le tocan (o quedaron pendientes) + manuales de Jefatura.
export function tareasPuesto(v, fecha, turno, puesto) {
  const dia = Number(fecha.slice(8, 10));
  const regDe = (id) => v.regs.find((r) => r.tarea_id === id && r.puesto === puesto);
  const fijas = v.matriz.filter((t) => t.puesto === puesto && t.activa !== false && t.grupo !== "mes" && (t.turnos || []).includes(turno));
  const lista = mensuales(v.matriz, puesto);
  const mes = lista
    .map((t) => ({ ...t, desde: diaMes(t, turno, lista) }))
    .filter((t) => t.desde && dia >= t.desde && (regDe(t.id) || !v.mes.some((r) => r.tarea_id === t.id && r.puesto === puesto)));
  const manuales = (v.ajustes.find((a) => a.puesto === puesto)?.manuales || []).map((m) => ({ ...m, grupo: "manual", puesto }));
  return [...fijas, ...mes, ...manuales].map((t) => ({ t, reg: regDe(t.id) }));
}

export function avance(items) {
  const ok = items.filter((i) => i.reg?.estado === "ok").length;
  const no = items.filter((i) => i.reg?.estado === "no").length;
  const total = items.length;
  return { total, prog: total, ok, no, na: 0, pend: total - ok - no, pct: total ? Math.round((ok / total) * 100) : 0 };
}

export function marcar({ reg, t, fecha, turno, puesto, vigilante }, data) {
  if (reg) return base44.entities.RegistroVigilante.update(reg.id, data);
  return base44.entities.RegistroVigilante.create({ fecha, turno, puesto, tarea_id: t.id, mensual: t.grupo === "mes", vigilante, ...data });
}

export function guardarManuales(v, fecha, turno, puesto, manuales) {
  const aj = v.ajustes.find((a) => a.puesto === puesto);
  if (aj) return base44.entities.TurnoVigilante.update(aj.id, { manuales });
  return base44.entities.TurnoVigilante.create({ fecha, turno, puesto, manuales });
}