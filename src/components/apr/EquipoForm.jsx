import { useState } from "react";
import { Loader2 } from "lucide-react";
import { card } from "@/lib/apr";

const inputCls = "w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#2a64b8]";

export default function EquipoForm({ onSave, onCancel }) {
  const [f, setF] = useState({ nombre: "", email: "", cargo: "", perfil: "asesor" });
  const [busy, setBusy] = useState(false);
  const set = (p) => setF((s) => ({ ...s, ...p }));
  const ok = f.nombre.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
  const submit = async () => { setBusy(true); await onSave(f); setBusy(false); };

  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="font-heading text-xl">Agregar integrante</div>
      <div className="grid sm:grid-cols-2 gap-2">
        <input aria-label="Nombre" value={f.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Nombre completo" className={inputCls} />
        <input aria-label="Correo" type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} placeholder="Correo" className={inputCls} />
        <input aria-label="Cargo" value={f.cargo} onChange={(e) => set({ cargo: e.target.value })} placeholder="Cargo (opcional)" className={inputCls} />
        <select aria-label="Perfil" value={f.perfil} onChange={(e) => set({ perfil: e.target.value })} className={inputCls}>
          <option value="asesor">Asesor</option>
          <option value="jefatura">Jefatura</option>
        </select>
      </div>
      <p className="text-xs text-[#6b7778]">Al ingresar por primera vez con este correo, la persona recibe automáticamente su perfil.</p>
      <div className="flex gap-2">
        <button disabled={!ok || busy} onClick={submit} className="flex-1 md:flex-none min-h-[44px] md:min-h-0 px-4 py-2.5 md:py-2 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Guardar</button>
        <button onClick={onCancel} className="flex-1 md:flex-none min-h-[44px] md:min-h-0 px-4 py-2.5 md:py-2 rounded-md text-sm text-[#3c4849] hover:bg-[#eef1f1]">Cancelar</button>
      </div>
    </div>
  );
}