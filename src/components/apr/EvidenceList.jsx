import { useState } from "react";
import { Loader2, Camera, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { uploadFiles, openFile } from "@/lib/aprActions";

export default function EvidenceList({ items = [], editable, onAdd }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    if (!e.target.files?.length) return;
    setBusy(true);
    const f = await uploadFiles(e.target.files);
    e.target.value = "";
    await onAdd(f);
    setBusy(false);
  };
  return (
    <div className="flex gap-2 items-center flex-wrap">
      {editable && (
        <label className="px-3 py-2.5 md:py-[7px] min-h-[44px] md:min-h-0 rounded-md bg-[#007f80] text-white text-sm md:text-[13px] cursor-pointer flex items-center gap-1.5 hover:bg-[#005f60] transition-colors">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} Sacar foto
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} disabled={busy} />
        </label>
      )}
      {editable && (
        <label className="px-3 py-2.5 md:py-[7px] min-h-[44px] md:min-h-0 rounded-md border border-dashed border-[#7fb8b8] bg-white text-sm md:text-[13px] text-[#005f60] cursor-pointer flex items-center gap-1.5 hover:bg-[#e8f5f5] transition-colors">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Adjuntar evidencia
          <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={pick} disabled={busy} />
        </label>
      )}
      {items.map((f, i) => (
        <button key={i} onClick={() => openFile(f.uri)} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-white border border-[#dde5e4] text-[#3c4849] hover:border-[#007f80] max-w-[200px]">
          {f.is_img ? <ImageIcon className="w-3.5 h-3.5 flex-none text-[#007f80]" /> : <FileText className="w-3.5 h-3.5 flex-none text-[#007f80]" />}
          <span className="truncate">{f.name}</span>
        </button>
      ))}
    </div>
  );
}