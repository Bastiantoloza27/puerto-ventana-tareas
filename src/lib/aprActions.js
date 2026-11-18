import { base44 } from "@/api/base44Client";
import { now } from "@/lib/apr";

// Lee la bitácora actual del servidor antes de agregar, para no pisar registros de otra persona.
export async function addLog(plan, texto) {
  const fresh = await base44.entities.Programacion.get(plan.id);
  const bitacora = [{ hora: now(), texto }, ...(fresh.bitacora || [])].slice(0, 300);
  plan.bitacora = bitacora;
  await base44.entities.Programacion.update(plan.id, { bitacora });
}

// Jefatura reabre un turno cerrado para que el asesor corrija; queda en la bitácora.
export async function reabrirTurno(plan) {
  const me = await base44.auth.me();
  await base44.entities.Programacion.update(plan.id, { estado: "publicada", reabierta: true });
  await addLog(plan, `Turno reabierto para corrección por ${me.full_name || me.email}`);
}

// Anula un turno publicado por error: vuelve a borrador sin asesor y cancela el correo agendado.
export async function anularTurno(plan, motivo) {
  await base44.entities.Programacion.update(plan.id, { estado: "borrador", asesor: null, publicada_hora: null, envio_estado: null, envio_hora: null, reabierta: false });
  await addLog(plan, `Turno anulado (estaba asignado a ${plan.asesor || "—"}) · ${motivo}`);
}

// Guarda la programación del turno; si no existe aún, revisa el servidor antes de crearla (evita duplicados).
export async function upsertPlan(plan, fecha, turno, data) {
  const p = plan || (await base44.entities.Programacion.filter({ fecha, turno }, { limit: 1 })).items[0];
  if (p) { await base44.entities.Programacion.update(p.id, data); return { ...p, ...data }; }
  return base44.entities.Programacion.create({ fecha, turno, estado: "borrador", bitacora: [], ...data });
}

export async function sendProgram(programacion_id, programar = false) {
  const { data } = await base44.functions.invoke("sendShiftProgram", { programacion_id, programar });
  if (data.programado) return `El correo con las tareas le llegará al asesor a las ${data.hora}, al inicio del turno.`;
  return `Enviado a ${data.sent.join(", ")}${data.asesor_ok ? "" : " · no se encontró el correo del asesor en el equipo registrado"}`;
}

// El servidor valida que quien guarda sea el asesor asignado (o Jefatura) y solo acepta resultado y evidencia.
export async function saveExec(plan, actividad_id, _existing, patch) {
  return base44.functions.invoke("guardarEjecucion", { programacion_id: plan.id, actividad_id, patch });
}

export async function addExtraExec(plan, extra) {
  return base44.functions.invoke("guardarEjecucion", { programacion_id: plan.id, extra });
}

export async function bumpMin(plan, fields, d) {
  if (!fields.length || !plan.asesor) return;
  const mes = plan.fecha.slice(0, 7);
  const rec = (await base44.entities.MinimoMensual.filter({ mes, asesor: plan.asesor }, { limit: 1 })).items[0];
  const vals = Object.fromEntries(fields.map((f) => [f, Math.max(0, (rec?.[f] || 0) + d)]));
  if (rec) await base44.entities.MinimoMensual.update(rec.id, vals);
  else if (d > 0) await base44.entities.MinimoMensual.create({ mes, asesor: plan.asesor, ...vals });
}

export async function uploadFiles(fileList) {
  const files = [...(fileList || [])];
  return Promise.all(
    files.map(async (file) => {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      return { name: file.name, uri: file_uri, is_img: file.type.startsWith("image/") };
    })
  );
}

export async function openFile(uri) {
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
  window.open(signed_url, "_blank");
}