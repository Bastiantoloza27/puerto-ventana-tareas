import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { card, SH } from "@/lib/apr";
import { corto, guardarManuales } from "@/lib/vigilantes";
import { attempt } from "@/lib/safe";

// Jefatura agrega tareas manuales al puesto en este turno, además de las fijas. No se envía correo.
export default function ManualesVig({ v, fecha, turno, puesto }) {
  const [tarea, setTarea] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const lista = v.ajustes.find((a) => a.puesto === puesto)?.manuales || [];
  const registrada = (id) => v.regs.some((r) => r.tarea_id === id && r.puesto === puesto && r.estado);
  const guardar = async (manuales, ok) => {
    setBusy(true);
    const r = await attempt(async () => { await guardarManuales(v, fecha, turno, puesto, manuales); return true; }, ok, "No se pudo guardar la tarea");
    setBusy(false);
    if (r) v.refresh();
    return r;
  };
  const agregar = async () => {
    if (!tarea.trim()) return;
    if (await guardar([...lista, { id: "man-" + Date.now(), tarea: tarea.trim(), descripcion: desc.trim() }], "Tarea agregada al turno")) { setTarea(""); setDesc(""); }
  };
  const inp = "w-full text-base md:text-sm px-3 py-2.5 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#2a64b8]";
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <span className="font-heading text-lg">Tareas manuales</span>
      <span className="text-xs text-[#6b7778]">{corto(puesto)} · {SH[turno].name} · aparecen junto a las fijas en el turno del vigilante</span>
      {lista.map((m) => (
        <div key={m.id} className="flex gap-2 items-start justify-between bg-[#f4f7fc] rounded-md px-3 py-2">
          <div className="flex flex-col min-w-0"><span className="text-sm font-medium">{m.tarea}</span>{m.descripcion && <span className="text-xs text-[#3c4849]">{m.descripcion}</span>}</div>
          {registrada(m.id) ? <span className="text-[11px] text-[#1d4a8c] whitespace-nowrap">Registrada</span>
            : <button disabled={busy} onClick={() => guardar(lista.filter((x) => x.id !== m.id), "Tarea quitada")} className="text-[#9b3b2e] p-1" aria-label="Quitar"><Trash2 className="w-4 h-4" /></button>}
        </div>
      ))}
      <input value={tarea} onChange={(e) => setTarea(e.target.value)} placeholder="Tarea (ej. Ronda extra sector bodegas)" className={inp} />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Descripción o instrucciones (opcional)" className={inp + " resize-y"} />
      <button onClick={agregar} disabled={busy || !tarea.trim()} className="px-4 py-2.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] disabled:opacity-60 text-white text-sm flex items-center justify-center gap-2 transition-colors">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}Agregar tarea al turno
      </button>
    </div>
  );
}