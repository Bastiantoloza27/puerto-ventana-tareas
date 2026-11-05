import { base44 } from "@/api/base44Client";
import { now } from "@/lib/apr";

// Lee la bitácora actual del servidor antes de agregar, para no pisar registros de otra persona.
export async function addLog(plan, texto) {
  const fresh = await base44.entities.Programacion.get(plan.id);
  const bitacora = [{ hora: now(), texto }, ...(fresh.bitacora || [])].slice(0, 300);
  plan.bitacora = bitacora;
  await base44.entities.Programacion.update(plan.id, { bitacora });
}

// Guarda la programación del turno; si no existe aún, revisa el servidor antes de crearla (evita duplicados).
export async function upsertPlan(plan, fecha, turno, data) {
  const p = plan || (await base44.entities.Programacion.filter({ fecha, turno }, { limit: 1 })).items[0];
  if (p) { await base44.entities.Programacion.update(p.id, data); return { ...p, ...data }; }
  return base44.entities.Programacion.create({ fecha, turno, estado: "borrador", bitacora: [], ...data });
}

export async function sendProgram(programacion_id) {
  const { data } = await base44.functions.invoke("sendShiftProgram", { programacion_id });
  return `Enviado a ${data.sent.join(", ")}${data.asesor_ok ? "" : " · no se encontró el correo del asesor en el equipo registrado"}`;
}

export async function saveExec(plan, actividad_id, existing, patch) {
  const e = existing || (await base44.entities.Ejecucion.filter({ programacion_id: plan.id, actividad_id }, { limit: 1 })).items[0];
  if (e) return base44.entities.Ejecucion.update(e.id, patch);
  return base44.entities.Ejecucion.create({ programacion_id: plan.id, actividad_id, evidencias: [], observaciones: "", ...patch });
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