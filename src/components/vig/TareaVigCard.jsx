import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { card, SH, shortDate } from "@/lib/apr";
import { marcar } from "@/lib/vigilantes";
import { attempt } from "@/lib/safe";
import EvidenceList from "@/components/apr/EvidenceList";

export default function TareaVigCard({ item, ctx, editable, onSaved }) {
  const { t, reg } = item;
  const otroTurno = reg && (reg.fecha !== ctx.fecha || reg.turno !== ctx.turno);
  const [obs, setObs] = useState(reg?.observaciones || "");
  const [busy, setBusy] = useState(false);
  useEffect(() => setObs(reg?.observaciones || ""), [reg?.id, reg?.observaciones]);
  const st = otroTurno ? "ok" : reg?.estado;
  const can = editable && !otroTurno && !busy;
  const save = async (data) => {
    setBusy(true);
    await attempt(async () => { await marcar({ reg, t, ...ctx }, data); await onSaved(); }, null, "No se pudo guardar");
    setBusy(false);
  };
  const btn = "min-h-[56px] rounded-lg text-base font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ";
  return (
    <div className={card + " p-4 flex flex-col gap-3 border-l-[6px] " + (st === "ok" ? "border-l-[#2e8b57]" : st === "no" ? "border-l-[#c0392b]" : "border-l-[#cdd4d4]")}>
      <div className="flex justify-between gap-3 items-start">
        <p className="text-[17px] leading-snug">{t.tarea}</p>
        {busy && <Loader2 className="w-5 h-5 animate-spin text-[#2a64b8] flex-none" />}
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs text-[#5b6b80]">
        <span className="bg-[#eef3fa] rounded px-2 py-1">{t.frecuencia}</span>
        {t.periodicidad && <span className="bg-[#eef3fa] rounded px-2 py-1">{t.periodicidad}</span>}
        <span className="px-1 py-1">Respaldo: {t.evidencia}</span>
      </div>
      {otroTurno ? (
        <span className="text-sm text-[#1f6b40] bg-[#e3f4ea] rounded-md px-3 py-2">Ya se hizo este mes · {shortDate(reg.fecha)} · {SH[reg.turno]?.name}</span>
      ) : <>
        <div className="grid grid-cols-2 gap-2">
          <button disabled={!can} onClick={() => save({ estado: "ok" })} className={btn + (st === "ok" ? "bg-[#2e8b57] text-white" : "bg-[#e3f4ea] text-[#1f6b40] hover:bg-[#cdebd9]")}><Check className="w-5 h-5" /> Hecha</button>
          <button disabled={!can} onClick={() => save({ estado: "no" })} className={btn + (st === "no" ? "bg-[#c0392b] text-white" : "bg-[#f8e1de] text-[#9b2c1f] hover:bg-[#f2cdc8]")}><X className="w-5 h-5" /> No se pudo</button>
        </div>
        {st && <>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} disabled={!can} rows={2}
            onBlur={() => obs !== (reg?.observaciones || "") && save({ observaciones: obs })}
            placeholder={st === "no" ? "Escribe por qué no se pudo" : "Comentario (opcional)"}
            className={"w-full rounded-lg border px-3 py-2.5 text-base " + (st === "no" && !obs.trim() ? "border-[#c0392b]" : "border-[#cdd4d4]")} />
          <EvidenceList items={reg?.evidencias || []} editable={can} onAdd={(f) => save({ evidencias: [...(reg?.evidencias || []), ...f] })} onRemove={(i) => save({ evidencias: reg.evidencias.filter((_, j) => j !== i) })} />
        </>}
      </>}
    </div>
  );
}