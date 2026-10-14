import { base44 } from "@/api/base44Client";
import { now } from "@/lib/apr";

export async function addLog(plan, texto) {
  const bitacora = [{ hora: now(), texto }, ...(plan.bitacora || [])];
  plan.bitacora = bitacora;
  await base44.entities.Programacion.update(plan.id, { bitacora });
}

export async function saveExec(plan, actividad_id, existing, patch) {
  if (existing) return base44.entities.Ejecucion.update(existing.id, patch);
  return base44.entities.Ejecucion.create({ programacion_id: plan.id, actividad_id, evidencias: [], observaciones: "", ...patch });
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