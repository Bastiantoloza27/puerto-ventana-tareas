import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { card, LUG } from "@/lib/apr";

const EMPTY = { proceso: "", sitio: "", descripcion: "" };
const field = "w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#2a64b8]";

// Actividad no programada que Jefatura pide durante el turno.
export default function ExtraForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  if (!open) return (
    <button onClick={() => setOpen(true)} className="self-start flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] md:min-h-0 rounded-md border border-dashed border-[#2a64b8] text-sm text-[#1d4a8c] hover:bg-[#eaf1fb] transition-colors">
      <Plus className="w-4 h-4" />Agregar actividad extraordinaria
    </button>
  );
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    setBusy(true);
    const ok = await onAdd({ proceso: f.proceso.trim(), sitio: f.sitio, descripcion: f.descripcion.trim() });
    setBusy(false);
    if (ok) { setF(EMPTY); setOpen(false); }
  };
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="font-heading text-xl">Actividad extraordinaria</div>
      <span className="text-[13px] text-[#6b7778] -mt-2">Solicitada por Jefatura durante el turno. Después regístrala como cualquier otra.</span>
      <input value={f.proceso} onChange={set("proceso")} placeholder="Actividad (ej. Inspección de andamio)" className={field} />
      <select value={f.sitio} onChange={set("sitio")} className={field}>
        <option value="">Lugar…</option>
        {LUG.map((l) => <option key={l}>{l}</option>)}
      </select>
      <textarea value={f.descripcion} onChange={set("descripcion")} rows={2} placeholder="Detalle de lo solicitado (opcional)" className={field + " resize-y"} />
      <div className="flex gap-2">
        <button disabled={busy || !f.proceso.trim() || !f.sitio} onClick={submit} className="px-4 py-2.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm flex items-center gap-2 disabled:opacity-40">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}Agregar al turno
        </button>
        <button disabled={busy} onClick={() => { setF(EMPTY); setOpen(false); }} className="px-4 py-2.5 rounded-md border border-[#cdd4d4] text-sm hover:border-[#2a64b8]">Cancelar</button>
      </div>
    </div>
  );
}