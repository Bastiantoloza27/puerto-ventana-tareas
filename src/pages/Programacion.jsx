import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card, chipCls, ASES, SH, now } from "@/lib/apr";
import { addLog } from "@/lib/aprActions";
import CatalogPicker from "@/components/apr/CatalogPicker";
import OpsMailPanel from "@/components/apr/OpsMailPanel";

export default function Programacion() {
  const { day, shift, plan } = useOutletContext();
  const [ids, setIds] = useState([]);
  const [asesor, setAsesor] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setIds(plan?.actividad_ids || []); setAsesor(plan?.asesor || null); setErr(""); }, [plan?.id, shift]);

  const locked = plan?.estado === "cerrada";
  const pub = plan?.estado === "publicada";
  const toggle = (id) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = async (publish) => {
    if (publish && (!asesor || !ids.length)) return setErr(!asesor ? "Asigna un asesor de turno antes de publicar." : "Selecciona al menos una actividad.");
    setBusy(true); setErr("");
    const data = { asesor, actividad_ids: ids, ...(publish ? { estado: "publicada", publicada_hora: now() } : {}) };
    let p = plan;
    if (p) await base44.entities.Programacion.update(p.id, data);
    else p = await base44.entities.Programacion.create({ fecha: day.fecha, turno: shift, estado: "borrador", bitacora: [], ...data });
    await addLog(p, publish ? `${pub ? "Programación republicada" : "Programación publicada"} · ${ids.length} actividades · ${asesor}` : "Borrador guardado");
    day.refresh(); setBusy(false);
  };

  return (
    <div className="flex flex-wrap gap-5 items-start">
      <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-4">
        <div className={card + " p-4 flex flex-col gap-3"}>
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <span className="font-heading text-xl">Asesor del {SH[shift].name}</span>
            <span className={"text-xs px-2.5 py-1 rounded-xl " + (locked ? "bg-[#eef1f1] text-[#5b6667]" : pub ? "bg-[#e2f4f4] text-[#005f60]" : "bg-[#fbf3dc] text-[#7a5d0e]")}>
              {locked ? "Turno cerrado" : pub ? `Publicada ${plan.publicada_hora}` : "Borrador"}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">{ASES.map((a) => <button key={a} disabled={locked} onClick={() => setAsesor(a)} className={chipCls(asesor === a)}>{a}</button>)}</div>
        </div>
        <CatalogPicker catalog={day.catalog} ids={ids} toggle={toggle} locked={locked} />
      </div>
      <div className="flex-[0_1_380px] min-w-[280px] flex flex-col gap-4 lg:sticky lg:top-6">
        <OpsMailPanel plan={plan} catalog={day.catalog} ids={ids} locked={locked} onApply={(m) => setIds((s) => [...s, ...m])} />
        {!locked && (
          <div className={card + " p-4 flex flex-col gap-3"}>
            <div className="flex justify-between text-[13px]"><span className="text-[#6b7778]">Actividades seleccionadas</span><span className="font-mono">{ids.length}</span></div>
            {err && <div className="text-xs text-[#9b3b2e] bg-[#f6e4e0] rounded-md px-3 py-2">{err}</div>}
            <button onClick={() => save(true)} disabled={busy} className="px-4 py-2.5 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm flex items-center justify-center gap-2 transition-colors">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}{pub ? "Republicar" : "Publicar"} y notificar al asesor
            </button>
            <button onClick={() => save(false)} disabled={busy} className="px-4 py-2 rounded-md text-sm text-[#3c4849] hover:bg-[#eef1f1]">Guardar borrador</button>
            {pub && <span className="text-[11px] text-[#6b7778]">Republicar queda registrado en la bitácora del turno.</span>}
          </div>
        )}
      </div>
    </div>
  );
}