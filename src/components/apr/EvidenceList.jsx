import { useState } from "react";
import { Loader2, Camera, Paperclip, FileText, Image as ImageIcon, X } from "lucide-react";
import { uploadFiles, openFile } from "@/lib/aprActions";
import { attempt } from "@/lib/safe";

export default function EvidenceList({ items = [], editable, onAdd, onRemove }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    if (!e.target.files?.length) return;
    setBusy(true);
    const files = e.target.files;
    await attempt(async () => onAdd(await uploadFiles(files)), null, "No se pudo subir la evidencia");
    e.target.value = "";
    setBusy(false);
  };
  return (
    <div className="flex gap-2 items-center flex-wrap">
      {editable && (
        <label className="px-3 py-2.5 md:py-[7px] min-h-[44px] md:min-h-0 rounded-md bg-[#2a64b8] text-white text-sm md:text-[13px] cursor-pointer flex items-center gap-1.5 hover:bg-[#16386a] transition-colors">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} Sacar foto
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} disabled={busy} />
        </label>
      )}
      {editable && (
        <label className="px-3 py-2.5 md:py-[7px] min-h-[44px] md:min-h-0 rounded-md border border-dashed border-[#7fb8b8] bg-white text-sm md:text-[13px] text-[#16386a] cursor-pointer flex items-center gap-1.5 hover:bg-[#e8f5f5] transition-colors">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Adjuntar evidencia
          <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={pick} disabled={busy} />
        </label>
      )}
      {items.map((f, i) => (
        <span key={i} className="flex items-center rounded-md bg-white border border-[#dde5e4] hover:border-[#2a64b8] max-w-[230px]">
          <button onClick={() => attempt(() => openFile(f.uri), null, "No se pudo abrir el archivo")} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 text-[#3c4849] min-w-0">
            {f.is_img ? <ImageIcon className="w-3.5 h-3.5 flex-none text-[#2a64b8]" /> : <FileText className="w-3.5 h-3.5 flex-none text-[#2a64b8]" />}
            <span className="truncate">{f.name}</span>
          </button>
          {editable && onRemove && (
            <button onClick={() => confirm(`¿Quitar "${f.name}"?`) && onRemove(i)} aria-label={"Quitar " + f.name} className="p-2 md:p-1.5 border-l border-[#dde5e4] hover:bg-[#f6e4e0]"><X className="w-3.5 h-3.5 text-[#9b3b2e]" /></button>
          )}
        </span>
      ))}
    </div>
  );
}