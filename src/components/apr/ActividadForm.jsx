import { useState } from "react";
import { Loader2 } from "lucide-react";
import { card, chipCls, TIPO_LABEL } from "@/lib/apr";

const inputCls = "w-full text-[13px] px-3 py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#007f80]";

export default function ActividadForm({ initial, areas, onSave, onCancel }) {
  const [f, setF] = useState(initial || { area: areas[0] || "", sitio: "", proceso: "", tipo: "t", descripcion: "", base: true });
  const [busy, setBusy] = useState(false);
  const set = (p) => setF((s) => ({ ...s, ...p }));
  const ok = f.area.trim() && f.sitio.trim() && f.proceso.trim();
  const submit = async () => { setBusy(true); await onSave(f); setBusy(false); };

  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="font-heading text-xl">{initial ? "Editar actividad" : "Nueva actividad"}</div>
      <div className="grid sm:grid-cols-3 gap-2">
        <input list="apr-areas" value={f.area} onChange={(e) => set({ area: e.target.value })} placeholder="Área" className={inputCls} />
        <datalist id="apr-areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
        <input value={f.sitio} onChange={(e) => set({ sitio: e.target.value })} placeholder="Sitio" className={inputCls} />
        <input value={f.proceso} onChange={(e) => set({ proceso: e.target.value })} placeholder="Actividad / proceso" className={inputCls} />
      </div>
      <input value={f.descripcion || ""} onChange={(e) => set({ descripcion: e.target.value })} placeholder="Descripción (opcional)" className={inputCls} />
      <div className="flex gap-1.5 flex-wrap">{Object.entries(TIPO_LABEL).map(([k, l]) => <button key={k} onClick={() => set({ tipo: k })} className={chipCls(f.tipo === k)}>{l}</button>)}</div>
      <label className="flex items-center gap-2 text-[13px] cursor-pointer"><input type="checkbox" checked={!!f.base} onChange={(e) => set({ base: e.target.checked })} className="accent-[#007f80]" />Se programa todos los días (sugerida en todos los turnos)</label>
      <div className="flex gap-2">
        <button disabled={!ok || busy} onClick={submit} className="px-4 py-2 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm flex items-center gap-2 disabled:opacity-50">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Guardar</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm text-[#3c4849] hover:bg-[#eef1f1]">Cancelar</button>
      </div>
    </div>
  );
}