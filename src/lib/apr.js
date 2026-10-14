import { format } from "date-fns";

export const LOGO = "https://raw.githubusercontent.com/Bastiantoloza27/Puerto-Ventana-Tareas-Diarias-Muestra./main/handoff_programa_apr/assets/pvsa-logo.png";
export const SH = {
  T1: { name: "1° turno", hours: "08:00–15:30", short: "1er" },
  T2: { name: "2° turno", hours: "15:30–23:00", short: "2do" },
  T3: { name: "3° turno", hours: "23:00–08:00", short: "3er" },
};
export const ORDER = ["T1", "T2", "T3"];
export const ASES = ["Arenas Binett Joel", "Bernal Mena Miguel", "Burgos Godoy Andrés", "Burgos Godoy Ariel", "Campos Torres Rodrigo", "González Romero Mario", "Maulen Vicencio Benjamín", "Velazquez Acuña Cesar"];
export const MOT = ["Sin operación en el turno", "Atención de emergencia", "Prioricé otra actividad", "Condición climática", "Sin acceso o permiso", "Otro"];
export const TIPOS = ["Condición insegura", "Acto inseguro", "Incidente / cuasi accidente", "Operacional", "Medioambiente", "Aviso al siguiente turno"];
export const LUG = ["Sitio 2", "Sitio 3", "Sitio 5", "Terminal Costa", "Terminal de Granos", "Terminal Multicarga", "Centro de Acopio Terquim", "Control Tránsito", "Muelle", "Mantención", "Servicios Generales"];
export const CRIT = { Baja: ["#e9f1f0", "#3c6e6c"], Media: ["#fbf3dc", "#8a6a12"], Alta: ["#f6e4e0", "#9b3b2e"] };
export const NOMB = {
  "Sitio 5": { f: "Descarga cemento big-bags · MV Chang Hang Jin Hai", jefe: "Jefe nave 349", n: { T1: 41, T2: 39, T3: 22 }, c: ["1347", "1062", "1178", "1404", "1225"] },
  "Sitio 3": { f: "Ceniza soda · MV Jasmine K", jefe: "Jefe nave 412", n: { T1: 16, T2: 16, T3: 0 }, c: ["1290", "1331", "1412", "1187"] },
  "Terminal de Granos": { f: "Recepción cemento · TGL", jefe: "Sup. stacking 675", n: { T1: 32, T2: 30, T3: 0 }, c: ["1215", "1108", "1256", "1093"] },
  "Centro de Acopio Terquim": { f: "Despacho acero + palanquilla", jefe: "Sup. stacking 702", n: { T1: 19, T2: 18, T3: 0 }, c: ["1140", "1371", "1066"] },
  "Control Tránsito": { f: "Equipo control de tránsito", jefe: "Supervisor 518", n: { T1: 8, T2: 8, T3: 4 }, c: ["1502", "1519", "1488"] },
  "Sitio 2": { f: "Embarque concentrado · MV Andes Star (desde 17:30)", jefe: "Jefe nave 377", n: { T1: 0, T2: 24, T3: 24 }, c: ["1601", "1618", "1633"] },
};
export const MINS = [
  ["charlas", "Charlas de 5 minutos", 4, "Registro físico"],
  ["conducta", "Observación de conducta", 4, "SAFEX · Módulo conductual"],
  ["inspeccion", "Inspección planeada de seguridad", 4, "SAFEX · Módulo reportabilidad"],
  ["epp", "Inspección de EPP", 4, "SAFEX · Listas de chequeo"],
  ["cuasi", "Reporte de cuasi-accidentes", null, "SAFEX · Reportabilidad · cada vez"],
];
export const EXIGIR_EVIDENCIA = false;
export const TIPO_LABEL = { t: "Transversal", o: "Según operación", c: "Según ocurrencia" };

export const now = () => format(new Date(), "HH:mm");
export const today = () => format(new Date(), "yyyy-MM-dd");
export const shortDate = (f) => (f ? f.slice(8, 10) + "-" + f.slice(5, 7) : "");
export const nextShift = (sh) => ORDER[(ORDER.indexOf(sh) + 1) % 3];

export function kpi(plan, execs, catalog) {
  const c = { prog: 0, ok: 0, no: 0, na: 0, pend: 0, pendList: [], pct: 0, ready: false, motivos: {} };
  if (!plan) return c;
  const E = Object.fromEntries((execs || []).filter((e) => e.programacion_id === plan.id).map((e) => [e.actividad_id, e]));
  const ids = (plan.actividad_ids || []).filter((id) => catalog.some((a) => a.id === id));
  c.prog = ids.length;
  ids.forEach((id) => {
    const e = E[id];
    const st = e?.estado;
    const bad = !st || (st === "no" && !e.motivo) || (st === "ok" && EXIGIR_EVIDENCIA && !(e.evidencias || []).length);
    if (st === "ok") c.ok++;
    else if (st === "no") { c.no++; if (e.motivo) c.motivos[e.motivo] = (c.motivos[e.motivo] || 0) + 1; }
    else if (st === "na") c.na++;
    if (bad) {
      if (!st) c.pend++;
      const a = catalog.find((x) => x.id === id);
      c.pendList.push(a.proceso + " · " + a.sitio + (st === "no" ? " (falta motivo)" : st === "ok" ? " (falta evidencia)" : ""));
    }
  });
  c.pct = c.prog - c.na > 0 ? Math.round((c.ok / (c.prog - c.na)) * 100) : 0;
  c.ready = c.pendList.length === 0 && c.prog > 0;
  return c;
}

export const card = "bg-white border border-[#dde5e4] rounded-[10px] shadow-[0_1px_2px_rgba(14,42,43,.05),0_6px_18px_rgba(14,42,43,.04)]";
export const chipCls = (on) =>
  "text-sm md:text-[13px] px-3 py-2.5 md:py-1.5 rounded-[14px] border transition-colors " +
  (on ? "bg-[#007f80] border-[#007f80] text-white" : "bg-white border-[#cdd4d4] text-[#1c2526] hover:border-[#007f80]");