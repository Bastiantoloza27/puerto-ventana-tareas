import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { base44 } from "@/api/base44Client";


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

// Dibuja el reporte en una imagen y la reparte en hojas A4, cortando solo entre filas o fotos.
export async function htmlToPdf(html, css, filename) {
  const W = 794;
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;left:0;top:0;width:${W}px;background:#fff;z-index:-9999`;
  el.innerHTML = `<style>${css}</style><div class="pdf">${html}</div>`;
  document.body.appendChild(el);
  await Promise.all([...el.querySelectorAll("img")].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })));
  const top = el.getBoundingClientRect().top;
  const cuts = [...el.querySelectorAll("tr,.ph,h1,h2,p,.k,.sig")].map((n) => n.getBoundingClientRect().bottom - top).sort((a, b) => a - b);
  const scale = 2;
  const canvas = await html2canvas(el, { useCORS: true, scale, backgroundColor: "#fff", windowWidth: W, scrollX: 0, scrollY: -window.scrollY });
  el.remove();

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ptPerPx = 595 / W, margin = 28, pageH = (842 - margin * 2) / ptPerPx;
  const total = canvas.height / scale;
  let y = 0, first = true;
  while (y < total - 1) {
    let end = Math.min(y + pageH, total);
    if (end < total) { const c = cuts.filter((b) => b > y + 40 && b <= end).pop(); if (c) end = c + 2; }
    const part = document.createElement("canvas");
    part.width = canvas.width; part.height = Math.ceil((end - y) * scale);
    part.getContext("2d").drawImage(canvas, 0, -y * scale);
    if (!first) doc.addPage();
    doc.addImage(part.toDataURL("image/jpeg", 0.85), "JPEG", 0, margin, 595, (end - y) * ptPerPx);
    first = false; y = end;
  }
  doc.save(filename);
}