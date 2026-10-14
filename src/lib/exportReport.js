import { SH, shortDate, TIPO_LABEL } from "@/lib/apr";

const LOGO = "https://raw.githubusercontent.com/Bastiantoloza27/Puerto-Ventana-Tareas-Diarias-Muestra./main/handoff_programa_apr/assets/pvsa-logo.png";
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
  const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
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
  const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
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
  const body = `<img src="${LOGO}" style="height:38px"><h1>Tareas asignadas · ${SH[plan.turno].name}</h1><p>${plan.fecha} · ${SH[plan.turno].hours} · Asesor de turno: <b>${plan.asesor || "—"}</b> · ${rows.length} actividades</p>
<table><tr><th>N°</th><th>Área</th><th>Sitio</th><th>Proceso</th><th>Actividad a desarrollar</th><th>Tipo</th></tr>${rows.map((a, i) => `<tr><td>${i + 1}</td><td>${a.area}</td><td>${a.sitio}</td><td>${a.proceso}</td><td>${a.descripcion || ""}</td><td>${TIPO_LABEL[a.tipo] || ""}</td></tr>`).join("") || '<tr><td colspan="6">Sin actividades asignadas</td></tr>'}</table>
<div class="sig"><div>${plan.asesor || ""}<br><small>Asesor de turno</small></div><div>Jefatura de Prevención</div></div>`;
  const css = "body{font:10.5pt/1.45 Arial,sans-serif;color:#1f2a2a;margin:1.5cm}h1{font:400 21pt Georgia,serif;margin:.4em 0 .1em}table{width:100%;border-collapse:collapse;font-size:9pt}td,th{border-bottom:1px solid #ccc;padding:5px 4px;text-align:left;vertical-align:top}th{color:#555}.sig{display:flex;gap:3cm;margin-top:2cm}.sig div{border-top:1px solid #000;padding-top:4px;min-width:6cm}";
  const w = window.open("", "_blank");
  if (!w) return dl("Tareas asignadas.html", '<!doctype html><meta charset="utf-8"><style>' + css + "</style>" + body, "text/html");
  w.document.title = "Tareas asignadas " + SH[plan.turno].name;
  const st = w.document.createElement("style"); st.textContent = css; w.document.head.appendChild(st);
  w.document.body.innerHTML = body;
  setTimeout(() => w.print(), 500);
}

export function downloadConsolidado(plans) {
  const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  const L = [["FECHA", "TURNO", "ASESOR", "PROGRAMADAS", "EJECUTADAS", "NO EJECUTADAS", "NO OCURRIÓ", "CUMPLIMIENTO", "NOVEDADES", "CIERRE"]];
  plans.forEach((p) => L.push([p.fecha, SH[p.turno].name, p.asesor, p.r_prog, p.r_ok, p.r_no, p.r_na, p.r_pct + "%", p.r_novs, p.cerrada_hora]));
  dl("Consolidado mensual APR.csv", "\ufeff" + L.map((r) => r.map(q).join(";")).join("\n"), "text/csv");
}

export function printPdf(plan, catalog, execs, novs, k) {
  const s = summary(plan, k);
  const R = rowsFor(plan, catalog, execs);
  const body = `<img src="${LOGO}" style="height:38px"><h1>Reporte de turno · ${SH[plan.turno].name}</h1><p>${plan.fecha} · ${SH[plan.turno].hours} · Asesor de turno: <b>${plan.asesor || "—"}</b></p>
<div class="k"><div><small>Programadas</small><b>${s.prog}</b></div><div><small>Ejecutadas</small><b>${s.ok}</b></div><div><small>No ejecutadas</small><b>${s.no}</b></div><div><small>Cumplimiento</small><b>${s.pct}%</b></div></div>
<h2>Control de cumplimiento</h2><table><tr><th>N°</th><th>Área</th><th>Sitio</th><th>Proceso</th><th>Estado</th><th>Motivo / observación</th><th>Evid.</th></tr>${R.map((r) => `<tr><td>${r.n}</td><td>${r.area}</td><td>${r.sitio}</td><td>${r.proceso}</td><td>${stLabel(r.st)}</td><td>${[r.mot, r.obs].filter(Boolean).join(" · ")}</td><td>${r.ev || ""}</td></tr>`).join("") || '<tr><td colspan="7">Detalle no disponible</td></tr>'}</table>
<h2>Novedades</h2><table><tr><th>Hora</th><th>Lugar</th><th>Tipo</th><th>Crit.</th><th>Novedad</th><th>Quién estuvo</th><th>Acción</th></tr>${novs.map((n) => `<tr><td>${n.hora}</td><td>${n.lugar}</td><td>${n.tipo}</td><td>${n.criticidad}</td><td>${n.descripcion}</td><td>${n.quien || ""}</td><td>${n.accion || ""}</td></tr>`).join("") || '<tr><td colspan="7">Sin novedades</td></tr>'}</table>
<h2>Entrega al siguiente turno</h2><p>${plan.entrega || "—"}</p><div class="sig"><div>${plan.asesor || ""}<br><small>Asesor de turno</small></div><div>Jefatura de Prevención</div></div>`;
  const css = "body{font:10.5pt/1.45 Arial,sans-serif;color:#1f2a2a;margin:1.5cm}h1{font:400 21pt Georgia,serif;margin:.4em 0 .1em}h2{font:600 12pt Arial;margin:1.3em 0 .4em}table{width:100%;border-collapse:collapse;font-size:9pt}td,th{border-bottom:1px solid #ccc;padding:5px 4px;text-align:left;vertical-align:top}th{color:#555}.k{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.k div{border:1px solid #ccc;padding:8px;display:flex;flex-direction:column}.k b{font-size:16pt}.sig{display:flex;gap:3cm;margin-top:2cm}.sig div{border-top:1px solid #000;padding-top:4px;min-width:6cm}";
  const w = window.open("", "_blank");
  if (!w) return dl("Reporte de turno.html", '<!doctype html><meta charset="utf-8"><style>' + css + "</style>" + body, "text/html");
  w.document.title = "Reporte " + SH[plan.turno].name;
  const st = w.document.createElement("style"); st.textContent = css; w.document.head.appendChild(st);
  w.document.body.innerHTML = body;
  setTimeout(() => w.print(), 500);
}