import { useState } from "react";
import { Download, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import useLista from "@/hooks/useLista";
import { openFile } from "@/lib/aprActions";
import { attempt } from "@/lib/safe";
import { card, chipCls } from "@/lib/apr";
import { CATS_DOC } from "@/lib/coord";
import DocSubir from "@/components/coord/DocSubir";

export default function DocumentosPanel({ user }) {
  const [cat, setCat] = useState("");
  const docs = useLista("DocumentoCoordinador", { created_by_id: user.id, ...(cat ? { categoria: cat } : {}) }, { sort: "-created_date", limit: 200 });
  const del = (d) => confirm(`¿Eliminar "${d.nombre}"?`) && attempt(async () => { await base44.entities.DocumentoCoordinador.delete(d.id); docs.refresh(); }, "Documento eliminado", "No se pudo eliminar");
  return (
    <div className="flex flex-col gap-4">
      <DocSubir onSaved={docs.refresh} />
      <div className="flex gap-1.5 flex-wrap">{["", ...CATS_DOC].map((c) => <button key={c || "todas"} onClick={() => setCat(c)} className={chipCls(cat === c)}>{c || "Todos"}</button>)}</div>
      {!docs.loading && !docs.items.length && <div className={card + " p-5 text-sm text-[#6b7778]"}>No hay documentos en esta categoría.</div>}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {docs.items.map((d) => (
          <div key={d.id} className={card + " p-4 flex gap-3 items-start"}>
            <span className="w-10 h-10 rounded-md bg-[#eef3fa] text-[#2a64b8] grid place-items-center flex-none">{d.archivo?.is_img ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" title={d.nombre}>{d.nombre}</div>
              <div className="text-xs text-[#5b6b80]">{d.categoria} · {format(new Date(d.created_date), "dd-MM-yyyy")}</div>
              {d.descripcion && <div className="text-xs text-[#3c4849] mt-1 line-clamp-2">{d.descripcion}</div>}
            </div>
            <button onClick={() => attempt(() => openFile(d.archivo.uri), null, "No se pudo abrir el documento")} aria-label="Descargar"><Download className="w-4 h-4 text-[#2a64b8]" /></button>
            <button onClick={() => del(d)} aria-label="Eliminar"><Trash2 className="w-4 h-4 text-[#9b3b2e]" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}