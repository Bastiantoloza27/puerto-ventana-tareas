// Utilidades del espacio de Coordinación.
export const TIPOS = [
  ["reunion", "Reunión", "bg-[#dbe7f7] text-[#16386a]"],
  ["actividad", "Actividad", "bg-[#d6efee] text-[#0f5a5b]"],
  ["capacitacion", "Capacitación", "bg-[#f6ecd0] text-[#6d5310]"],
  ["gestion", "Gestión / SGI", "bg-[#e7e2f3] text-[#46386e]"],
  ["recordatorio", "Recordatorio", "bg-[#e9edf2] text-[#3c4a5c]"],
];
const T = (t) => TIPOS.find((x) => x[0] === t) || TIPOS[4];
export const tipoCls = (t) => T(t)[2];
export const tipoLabel = (t) => T(t)[1];

export const EST_T = {
  pendiente: ["Pendiente", "bg-[#eceff3] text-[#4b5b70]"],
  en_curso: ["En curso", "bg-[#dbe7f7] text-[#16386a]"],
  completada: ["Completada", "bg-[#e3f4ea] text-[#1f6b40]"],
};
export const PRIO = { alta: ["Prioridad alta", "text-[#9b2c1f]"], media: ["Prioridad media", "text-[#7a5d0e]"], baja: ["Prioridad baja", "text-[#4b5b70]"] };
export const CATS_DOC = ["SGI", "Presupuesto", "Compras", "Facturas", "Capacitación", "Seguridad ISPS", "Otro"];

export const inp = "w-full rounded-md border border-[#cdd4d4] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#2a64b8] transition-colors";
export const btnP = "px-4 py-2.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50";
export const btnS = "px-3 py-2 rounded-md text-sm border border-[#cdd4d4] hover:border-[#2a64b8] bg-white text-[#1c2526] inline-flex items-center gap-1.5 transition-colors";

export const toMin = (h) => { const [a, b] = String(h || "0:0").split(":").map(Number); return a * 60 + (b || 0); };
export const fromMin = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
export const SLOTS = Array.from({ length: 36 }, (_, i) => 360 + i * 30); // 06:00 a 23:30
export const durLabel = (m) => (m < 60 ? m + " min" : m / 60 + (m === 60 ? " h" : " h"));
export const rango = (e) => (e.hora_inicio ? e.hora_inicio + (e.hora_fin ? "–" + e.hora_fin : "") : "Sin hora");