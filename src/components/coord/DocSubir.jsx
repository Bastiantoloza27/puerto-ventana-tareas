import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFiles } from "@/lib/aprActions";
import { attempt } from "@/lib/safe";
import { card } from "@/lib/apr";
import { inp, CATS_DOC } from "@/lib/coord";

export default function DocSubir({ onSaved }) {
  const [cat, setCat] = useState(CATS_DOC[0]);
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setBusy(true);
    const ok = await attempt(async () => {
      const subidos = await uploadFiles(files);
      await base44.entities.DocumentoCoordinador.bulkCreate(subidos.map((f) => ({ nombre: f.name, categoria: cat, descripcion: desc, archivo: f })));
    }, `${files.length} documento${files.length > 1 ? "s" : ""} guardado${files.length > 1 ? "s" : ""}`, "No se pudo subir el documento");
    e.target.value = "";
    setBusy(false);
    if (ok) { setDesc(""); onSaved(); }
  };
  return (
    <div className={card + " p-4 flex flex-col sm:flex-row gap-2 sm:items-center"}>
      <select value={cat} onChange={(e) => setCat(e.target.value)} className={inp + " sm:w-44"}>{CATS_DOC.map((c) => <option key={c}>{c}</option>)}</select>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción (opcional)" className={inp} />
      <label className="px-4 py-2.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Subir documentos
        <input type="file" multiple className="hidden" onChange={pick} disabled={busy} />
      </label>
    </div>
  );
}