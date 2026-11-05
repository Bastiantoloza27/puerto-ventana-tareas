import { useState } from "react";
import { Loader2 } from "lucide-react";
import { card, chipCls, TIPO_LABEL } from "@/lib/apr";

const inputCls = "w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#2a64b8]";

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
      <div className="flex gap-2 items-end">
        <label className="flex flex-col gap-1 flex-none">
          <span className="text-[11px] font-medium text-[#3c4849]">Orden</span>
          <input aria-label="Orden" type="number" min="0" value={f.orden ?? ""} onChange={(e) => set({ orden: e.target.value === "" ? null : Number(e.target.value) })} placeholder="1" className={inputCls + " w-24"} />
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[11px] font-medium text-[#3c4849]">Descripción</span>
          <input aria-label="Descripción" value={f.descripcion || ""} onChange={(e) => set({ descripcion: e.target.value })} placeholder="Opcional" className={inputCls} />
        </label>
      </div>
      <div className="flex gap-1.5 flex-wrap">{Object.entries(TIPO_LABEL).map(([k, l]) => <button key={k} onClick={() => set({ tipo: k })} className={chipCls(f.tipo === k)}>{l}</button>)}</div>
      <label className="flex items-center gap-2 py-1 text-sm md:text-[13px] cursor-pointer"><input type="checkbox" checked={!!f.base} onChange={(e) => set({ base: e.target.checked })} className="accent-[#2a64b8]" />Se programa todos los días (sugerida en todos los turnos)</label>
      <div className="flex gap-2">
        <button disabled={!ok || busy} onClick={submit} className="flex-1 md:flex-none min-h-[44px] md:min-h-0 px-4 py-2.5 md:py-2 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Guardar</button>
        <button onClick={onCancel} className="flex-1 md:flex-none min-h-[44px] md:min-h-0 px-4 py-2.5 md:py-2 rounded-md text-sm text-[#3c4849] hover:bg-[#eef1f1]">Cancelar</button>
      </div>
    </div>
  );
}