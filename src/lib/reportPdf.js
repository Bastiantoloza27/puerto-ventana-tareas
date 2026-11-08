import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { base44 } from "@/api/base44Client";

window.html2canvas = html2canvas;

// Descarga la foto y la achica para que el PDF no quede pesado.
async function toDataUrl(uri) {
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
  const blob = await (await fetch(signed_url)).blob();
  const bmp = await createImageBitmap(blob);
  const k = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.72);
}

// items: [{ titulo, evidencias }] → bloque HTML con las fotos adjuntas.
export async function evidenciasHtml(items, esc) {
  const fotos = items.flatMap((it) => (it.evidencias || []).filter((v) => v.is_img).map((v) => ({ titulo: it.titulo, uri: v.uri })));
  if (!fotos.length) return "";
  const srcs = await Promise.all(fotos.map((f) => toDataUrl(f.uri).catch(() => null)));
  const cells = fotos.map((f, i) => srcs[i] && `<div class="ph"><img src="${srcs[i]}"><small>${esc(f.titulo)}</small></div>`).filter(Boolean).join("");
  return cells ? `<h2>Evidencias fotográficas</h2><div class="phs">${cells}</div>` : "";
}

export async function htmlToPdf(html, css, filename) {
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff";
  el.innerHTML = `<style>${css}</style><div class="pdf">${html}</div>`;
  document.body.appendChild(el);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await new Promise((resolve) => doc.html(el, {
    x: 0, y: 0, width: 595, windowWidth: 794, autoPaging: "text", margin: [24, 0, 24, 0],
    html2canvas: { useCORS: true }, callback: resolve,
  }));
  el.remove();
  doc.save(filename);
}