import { SH, shortDate, TIPO_LABEL } from "@/lib/apr";
import { toast } from "@/components/ui/use-toast";
import { evidenciasHtml, htmlToPdf } from "@/lib/reportPdf";

const LOGO = "https://raw.githubusercontent.com/Bastiantoloza27/Puerto-Ventana-Tareas-Diarias-Muestra./main/handoff_programa_apr/assets/pvsa-logo.png";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const q = (v) => {
  let s = String(v ?? "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};
const stLabel = (st) => (st === "ok" ? "Ejecutado" : st === "no" ? "No ejecutado" : st === "na" ? "No ocurrió" : "—");

function rowsFor(plan, catalog, execs) {
  const E = Object.fromEntries(execs.map((e) => [e.actividad_id, e]));
  return (plan.actividad_ids || []).map((id) => catalog.find((a) => a.id === id)).filter(Boolean)
    .map((a, i) => { const e = E[a.id] || {}; return { n: i + 1, ...a, st: e.estado, mot: e.motivo || "", obs: e.observaciones || "", ev: (e.evidencias || []).length }; });
}

function dl(name, content, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}

const summary = (plan, k) => k || { prog: plan.r_prog || 0, ok: plan.r_ok || 0, no: plan.r_no || 0, na: plan.r_na || 0, pct: plan.r_pct || 0 };

export function downloadCsv(plan, catalog, execs, novs, k) {
  const s = summary(plan, k);
  const L = [["PROGRAMACIÓN DE ACTIVIDADES PREVENCIONISTA DE RIESGOS EN TURNO"], ["PROGRAMADO", plan.fecha, SH[plan.turno].name, "ASESOR DE TURNO", plan.asesor],
    ["ACTIVIDADES PROGRAMADAS", "ACTIVIDADES EJECUTADAS", "ACTIVIDADES NO EJECUTADAS", "NO OCURRIÓ", "PORCENTAJE DE CUMPLIMIENTO"], [s.prog, s.ok, s.no, s.na, s.pct + "%"], [],
    ["N°", "ÁREA", "SITIO/SECTOR/FUNCIÓN", "PROCESO", "ACTIVIDAD A DESARROLLAR", "EJECUTADO", "NO EJECUTADO", "MOTIVO", "EVIDENCIA", "OBSERVACIONES"]];
  rowsFor(plan, catalog, execs).forEach((r) => L.push([r.n, r.area, r.sitio, r.proceso, r.descripcion, r.st === "ok" ? 1 : 0, r.st === "no" ? 1 : 0, r.st === "na" ? "No ocurrió" : r.mot, r.ev ? r.ev + " archivo(s)" : "", r.obs]));
  L.push([], ["NOVEDADES DEL TURNO"], ["HORA", "LUGAR", "TIPO", "CRITICIDAD", "NOVEDAD", "QUIÉN ESTUVO", "ACCIÓN INMEDIATA"]);
  novs.forEach((n) => L.push([n.hora, n.lugar, n.tipo, n.criticidad, n.descripcion, n.quien, n.accion]));
  L.push([], ["ENTREGA AL SIGUIENTE TURNO", plan.entrega || "—"]);
  dl(`${shortDate(plan.fecha)} Programa de Actividades APR ${SH[plan.turno].short} Turno.csv`, "\ufeff" + L.map((r) => r.map(q).join(";")).join("\n"), "text/csv");
}

const programRows = (plan, catalog) =>
  (plan.actividad_ids || []).map((id) => catalog.find((a) => a.id === id)).filter(Boolean);

export function downloadProgramaCsv(plan, catalog) {
  const rows = programRows(plan, catalog);
  const L = [["PROGRAMACIÓN DE ACTIVIDADES · PREVENCIÓN DE RIESGOS"],
    ["PROGRAMADO", plan.fecha, SH[plan.turno].name, "ASESOR DE TURNO", plan.asesor || "—"],
    ["ACTIVIDADES ASIGNADAS", rows.length], [],
    ["N°", "ÁREA", "SITIO/SECTOR/FUNCIÓN", "PROCESO", "ACTIVIDAD A DESARROLLAR", "TIPO"]];
  rows.forEach((a, i) => L.push([i + 1, a.area, a.sitio, a.proceso, a.descripcion, TIPO_LABEL[a.tipo] || ""]));
  dl(`Tareas Asignadas ${SH[plan.turno].short} Turno ${shortDate(plan.fecha)}.csv`, "\ufeff" + L.map((r) => r.map(q).join(";")).join("\n"), "text/csv");
}

export function printProgramaPdf(plan, catalog) {
  const rows = programRows(plan, catalog);
  const body = `<img src="${LOGO}" style="height:38px"><h1>Tareas asignadas · ${esc(SH[plan.turno].name)}</h1><p>${esc(plan.fecha)} · ${esc(SH[plan.turno].hours)} · Asesor de turno: <b>${esc(plan.asesor || "—")}</b> · ${rows.length} actividades</p>
<table><tr><th>N°</th><th>Área</th><th>Sitio</th><th>Proceso</th><th>Actividad a desarrollar</th><th>Tipo</th></tr>${rows.map((a, i) => `<tr><td>${i + 1}</td><td>${esc(a.area)}</td><td>${esc(a.sitio)}</td><td>${esc(a.proceso)}</td><td>${esc(a.descripcion)}</td><td>${esc(TIPO_LABEL[a.tipo])}</td></tr>`).join("") || '<tr><td colspan="6">Sin actividades asignadas</td></tr>'}</table>
<div class="sig"><div>${esc(plan.asesor)}<br><small>Asesor de turno</small></div><div>Jefatura de Prevención</div></div>`;
  const css = "body{font:10.5pt/1.45 Arial,sans-serif;color:#1f2a2a;margin:1.5cm}h1{font:400 21pt Georgia,serif;margin:.4em 0 .1em}table{width:100%;border-collapse:collapse;font-size:9pt}td,th{border-bottom:1px solid #ccc;padding:5px 4px;text-align:left;vertical-align:top}th{color:#555}.sig{display:flex;gap:3cm;margin-top:2cm}.sig div{border-top:1px solid #000;padding-top:4px;min-width:6cm}";
  const w = window.open("", "_blank");
  if (!w) return dl("Tareas asignadas.html", '<!doctype html><meta charset="utf-8"><style>' + css + "</style>" + body, "text/html");
  w.document.title = "Tareas asignadas " + SH[plan.turno].name;
  const st = w.document.createElement("style"); st.textContent = css; w.document.head.appendChild(st);
  w.document.body.innerHTML = body;
  setTimeout(() => w.print(), 500);
}

export function downloadConsolidado(plans) {
  const L = [["FECHA", "TURNO", "ASESOR", "PROGRAMADAS", "EJECUTADAS", "NO EJECUTADAS", "NO OCURRIÓ", "CUMPLIMIENTO", "NOVEDADES", "CIERRE"]];
  plans.forEach((p) => L.push([p.fecha, SH[p.turno].name, p.asesor, p.r_prog, p.r_ok, p.r_no, p.r_na, p.r_pct + "%", p.r_novs, p.cerrada_hora]));
  dl("Consolidado mensual APR.csv", "\ufeff" + L.map((r) => r.map(q).join(";")).join("\n"), "text/csv");
}

export async function printPdf(plan, catalog, execs, novs, k) {
  const t = toast({ title: "Generando PDF…", description: "Incluyendo las fotos adjuntas" });
  const s = summary(plan, k);
  const R = rowsFor(plan, catalog, execs);
  const pill = (st) => `<span class="st st-${st || "x"}">${stLabel(st)}</span>`;
  const crit = (c) => `<span class="st cr-${esc(c || "x")}">${esc(c || "—")}</span>`;
  const body = `<div class="hd"><div class="lg"><img src="${LOGO}"></div><div class="ht"><small>PUERTO VENTANA S.A. · PREVENCIÓN DE RIESGOS</small><h1>Reporte de turno</h1><span>Programa de actividades del Asesor en Prevención de Riesgos</span></div><div class="cd"><small>N° REPORTE</small><b>${esc(SH[plan.turno].short)}-${esc(plan.fecha.replaceAll("-", ""))}</b></div></div>
<div class="info"><div><small>Fecha</small><b>${esc(shortDate(plan.fecha))}</b></div><div><small>Turno</small><b>${esc(SH[plan.turno].name)}</b></div><div><small>Horario</small><b>${esc(SH[plan.turno].hours)}</b></div><div><small>Asesor de turno</small><b>${esc(plan.asesor || "—")}</b></div></div>
<div class="k"><div><small>Programadas</small><b>${esc(s.prog)}</b></div><div class="g"><small>Ejecutadas</small><b>${esc(s.ok)}</b></div><div class="r"><small>No ejecutadas</small><b>${esc(s.no)}</b></div><div class="t"><small>Cumplimiento</small><b>${esc(s.pct)}%</b></div></div>
<h2>1. Control de cumplimiento</h2><table><tr><th>N°</th><th>Área</th><th>Sitio</th><th>Proceso</th><th>Estado</th><th>Motivo / observación</th><th>Evid.</th></tr>${R.map((r) => `<tr><td>${r.n}</td><td>${esc(r.area)}</td><td>${esc(r.sitio)}</td><td>${esc(r.proceso)}</td><td>${pill(r.st)}</td><td>${esc([r.mot, r.obs].filter(Boolean).join(" · "))}</td><td>${r.ev || ""}</td></tr>`).join("") || '<tr><td colspan="7">Detalle no disponible</td></tr>'}</table>
<h2>2. Novedades del turno</h2><table><tr><th>Hora</th><th>Lugar</th><th>Tipo</th><th>Criticidad</th><th>Novedad</th><th>Quién estuvo</th><th>Acción</th></tr>${novs.map((n) => `<tr><td>${esc(n.hora)}</td><td>${esc(n.lugar)}</td><td>${esc(n.tipo)}</td><td>${crit(n.criticidad)}</td><td>${esc(n.descripcion)}</td><td>${esc(n.quien)}</td><td>${esc(n.accion)}</td></tr>`).join("") || '<tr><td colspan="7">Sin novedades registradas</td></tr>'}</table>
<h2>3. Entrega al siguiente turno</h2><p class="ent">${esc(plan.entrega || "Sin observaciones de entrega.")}</p>`;
  const E = Object.fromEntries(execs.map((e) => [e.actividad_id, e]));
  const fotos = await evidenciasHtml([
    ...R.map((r) => ({ titulo: `${r.n}. ${r.proceso} · ${r.sitio}`, evidencias: E[r.id]?.evidencias })),
    ...novs.map((n) => ({ titulo: `Novedad ${n.hora || ""} · ${n.lugar || ""}`, evidencias: n.evidencias })),
  ], esc);
  const sig = `<h2>4. Validación</h2><div class="sig"><div><span></span><b>${esc(plan.asesor || "")}</b><small>Asesor de turno · Cierre ${esc(plan.cerrada_hora || "")}</small></div><div><span></span><b>&nbsp;</b><small>Jefatura de Prevención de Riesgos</small></div></div>`;
  const css = `.pdf{font:10pt/1.45 Arial,sans-serif;color:#1f2a2a;padding:0 36px}
.hd{display:flex;align-items:stretch;background:#16386a;color:#fff;border-radius:6px;overflow:hidden;border-bottom:4px solid #00abac}
.lg{background:#fff;padding:12px 16px;display:flex;align-items:center}.lg img{height:44px}
.ht{flex:1;padding:12px 18px}.ht small{font-size:7.5pt;letter-spacing:.12em;color:#9fc3ee}.ht h1{font:400 22pt Georgia,serif;margin:2px 0}.ht span{font-size:8.5pt;color:#d6e3f5}
.cd{padding:12px 16px;border-left:1px solid #2f5892;display:flex;flex-direction:column;justify-content:center;text-align:right}.cd small{font-size:7pt;letter-spacing:.1em;color:#9fc3ee}.cd b{font:500 11pt monospace}
.info{display:grid;grid-template-columns:1fr 1fr 1fr 1.4fr;border:1px solid #c9d5e6;border-radius:6px;margin-top:14px;background:#f5f8fc}.info div{padding:8px 12px;border-right:1px solid #c9d5e6;display:flex;flex-direction:column}.info div:last-child{border:0}.info small,.k small{font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:#5b6b80}.info b{font-size:10.5pt}
.k{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}.k div{border:1px solid #c9d5e6;border-top:3px solid #2a64b8;border-radius:6px;padding:8px 12px;display:flex;flex-direction:column}.k b{font:500 18pt monospace}.k .g{border-top-color:#2e8b57}.k .r{border-top-color:#c0392b}.k .t{border-top-color:#00abac;background:#e8f7f7}
h2{font:700 10.5pt Arial;color:#16386a;text-transform:uppercase;letter-spacing:.05em;margin:20px 0 8px;padding:5px 10px;border-left:4px solid #2a64b8;background:#eef3fa}
table{width:100%;border-collapse:collapse;font-size:8.5pt}th{background:#2a64b8;color:#fff;font-weight:600;padding:6px 5px;text-align:left}td{border-bottom:1px solid #dbe3ee;padding:5px;vertical-align:top}tr:nth-child(odd) td{background:#f7f9fc}
.st{display:inline-block;padding:1px 7px;border-radius:9px;font-size:7.5pt;font-weight:600;white-space:nowrap;background:#eceff3;color:#5b6b80}.st-ok,.cr-Baja{background:#e3f4ea;color:#1f6b40}.st-no,.cr-Alta{background:#f8e1de;color:#9b2c1f}.cr-Media{background:#fbf0d5;color:#7a5d0e}
.ent{border:1px solid #dbe3ee;border-radius:6px;padding:10px 12px;margin:0;white-space:pre-wrap}
.sig{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:10px}.sig div{display:flex;flex-direction:column;text-align:center}.sig span{height:60px;border-bottom:1px solid #1f2a2a}.sig b{margin-top:5px}.sig small{color:#5b6b80;font-size:8pt}
.phs{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ph{border:1px solid #c9d5e6;border-radius:6px;padding:6px;background:#f5f8fc}.ph img{width:100%;height:250px;object-fit:contain;display:block;background:#fff}.ph small{display:block;margin-top:5px;color:#16386a;font-weight:600;font-size:8pt}`;
  await htmlToPdf(body + sig + fotos, css, `Reporte ${SH[plan.turno].short} Turno ${shortDate(plan.fecha)}.pdf`, `Reporte de turno · ${SH[plan.turno].name} · ${shortDate(plan.fecha)}`);
  t.dismiss();
}