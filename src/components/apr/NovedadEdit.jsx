import { useState } from "react";
import { Loader2 } from "lucide-react";
import { chipCls, LUG, TIPOS, CRIT } from "@/lib/apr";
import EvidenceList from "@/components/apr/EvidenceList";

const inputCls = "w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#007f80]";

export default function NovedadEdit({ nov, onSave, onCancel }) {
  const [f, setF] = useState({ lugar: nov.lugar, tipo: nov.tipo, criticidad: nov.criticidad, descripcion: nov.descripcion || "", quien: nov.quien || "", accion: nov.accion || "", evidencias: nov.evidencias || [] });
  const [busy, setBusy] = useState(false);
  const set = (p) => setF((s) => ({ ...s, ...p }));
  const save = async () => {
    if (!f.descripcion.trim()) return;
    setBusy(true);
    await onSave({ ...f, descripcion: f.descripcion.trim(), quien: f.quien.trim(), accion: f.accion.trim() });
    setBusy(false);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 flex-wrap">{LUG.map((l) => <button key={l} onClick={() => set({ lugar: l })} className={chipCls(f.lugar === l)}>{l}</button>)}</div>
      <div className="flex gap-1.5 flex-wrap">{TIPOS.map((t) => <button key={t} onClick={() => set({ tipo: t })} className={chipCls(f.tipo === t)}>{t}</button>)}</div>
      <div className="flex gap-1.5">{Object.entries(CRIT).map(([c, [bg, fg]]) => (
        <button key={c} onClick={() => set({ criticidad: c })} className="text-[13px] px-3 py-1.5 rounded-[14px] border" style={f.criticidad === c ? { background: fg, borderColor: fg, color: "#fff" } : { background: bg, borderColor: bg, color: fg }}>{c}</button>))}</div>
      <textarea rows={3} value={f.descripcion} onChange={(e) => set({ descripcion: e.target.value })} placeholder="¿Qué pasó?" className={inputCls} />
      <input value={f.quien} onChange={(e) => set({ quien: e.target.value })} placeholder="Quién estuvo" className={inputCls} />
      <input value={f.accion} onChange={(e) => set({ accion: e.target.value })} placeholder="Acción inmediata" className={inputCls} />
      <EvidenceList items={f.evidencias} editable onAdd={(x) => set({ evidencias: [...f.evidencias, ...x] })} onRemove={(i) => set({ evidencias: f.evidencias.filter((_, j) => j !== i) })} />
      <div className="flex gap-2">
        <button onClick={save} disabled={busy} className="flex-1 md:flex-none min-h-[44px] md:min-h-0 px-4 py-2 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm flex items-center justify-center gap-2">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Guardar cambios</button>
        <button onClick={onCancel} className="flex-1 md:flex-none min-h-[44px] md:min-h-0 px-4 py-2 rounded-md border border-[#cdd4d4] text-sm">Cancelar</button>
      </div>
    </div>
  );
}