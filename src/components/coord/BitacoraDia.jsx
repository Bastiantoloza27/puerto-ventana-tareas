import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLista from "@/hooks/useLista";
import { card, now, today } from "@/lib/apr";
import { attempt } from "@/lib/safe";
import { inp, btnP } from "@/lib/coord";

export default function BitacoraDia({ user }) {
  const [fecha, setFecha] = useState(today());
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const notas = useLista("NotaBitacora", { created_by_id: user.id, fecha }, { sort: "-hora", limit: 100 });
  const add = async () => {
    if (!txt.trim()) return;
    setBusy(true);
    const ok = await attempt(() => base44.entities.NotaBitacora.create({ fecha, hora: now(), texto: txt.trim() }), null, "No se pudo guardar la nota");
    if (ok) { setTxt(""); notas.refresh(); }
    setBusy(false);
  };
  const del = (n) => confirm("¿Eliminar esta nota?") && attempt(async () => { await base44.entities.NotaBitacora.delete(n.id); notas.refresh(); }, null, "No se pudo eliminar");
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="flex justify-between items-center gap-2">
        <span className="font-heading text-lg">Bitácora del día</span>
        <input type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} className="text-xs border border-[#cdd4d4] rounded px-2 py-1 bg-white" />
      </div>
      <div className="flex gap-2">
        <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={2} placeholder="¿Qué avanzaste, gestionaste o acordaste?" className={inp} />
        <button onClick={add} disabled={busy || !txt.trim()} className={btnP + " self-end"}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Anotar</button>
      </div>
      {!notas.items.length && <span className="text-sm text-[#6b7778]">Sin anotaciones para este día.</span>}
      <ul className="flex flex-col divide-y divide-[#eef1f1]">
        {notas.items.map((n) => (
          <li key={n.id} className="py-2 flex gap-3 group">
            <span className="font-mono text-xs text-[#2a64b8] pt-0.5 w-11 flex-none">{n.hora}</span>
            <span className="text-sm flex-1 whitespace-pre-wrap">{n.texto}</span>
            <button onClick={() => del(n)} aria-label="Eliminar nota" className="opacity-60 hover:opacity-100"><Trash2 className="w-3.5 h-3.5 text-[#9b3b2e]" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}