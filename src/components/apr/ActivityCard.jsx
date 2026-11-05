import { useEffect, useRef, useState } from "react";
import { card, MOT } from "@/lib/apr";
import EvidenceList from "@/components/apr/EvidenceList";
import ControlChips from "@/components/apr/ControlChips";

const CHIP = {
  ok: ["#e4ecf8", "#1d4a8c", "#3b82d0"], no: ["#f6e4e0", "#9b3b2e", "#b9574a"],
  na: ["#eef1f1", "#5b6667", "#b8c1c2"], none: ["#fbf3dc", "#7a5d0e", "#e3c77a"],
};

export default function ActivityCard({ a, e, editable, onSet }) {
  const st = e?.estado;
  const [obs, setObs] = useState(e?.observaciones || "");
  const [busy, setBusy] = useState(false);
  const focused = useRef(false);
  // No pisa lo que la persona está escribiendo con datos del servidor.
  useEffect(() => { if (!focused.current) setObs(e?.observaciones || ""); }, [e?.observaciones]);
  // Autoguardado de observaciones mientras se escribe.
  useEffect(() => {
    if (!editable || obs === (e?.observaciones || "")) return;
    const t = setTimeout(() => onSet({ observaciones: obs }, null), 1200);
    return () => clearTimeout(t);
  }, [obs]);
  // Evita doble registro por toques repetidos.
  const act = async (patch, log) => { if (busy) return; setBusy(true); await onSet(patch, log); setBusy(false); };
  const obsProps = { onFocus: () => { focused.current = true; }, onBlur: () => { focused.current = false; saveObs(); } };
  const c = CHIP[st || "none"];
  const label = st === "ok" ? "Ejecutado · " + (e.hora || "") : st === "no" ? "No ejecutado" + (e.motivo ? "" : " · falta motivo") : st === "na" ? "No ocurrió" : "Por registrar";
  const btn = (on, onCls, offCls) => "flex-1 md:flex-none min-h-[44px] md:min-h-0 px-3.5 py-2.5 md:py-2 rounded-md text-sm md:text-[13px] border transition-colors " + (on ? onCls : offCls);
  const saveObs = () => obs !== (e?.observaciones || "") && onSet({ observaciones: obs }, null);

  return (
    <div className={card + " border-l-4 px-4 py-3.5 flex flex-col gap-2.5"} style={{ borderLeftColor: c[2] }}>
      <div className="flex justify-between gap-2.5 items-start flex-wrap">
        <div className="flex flex-col gap-[5px] min-w-0 flex-[1_1_320px]">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#eef3f3] text-[#3c4849]">{a.area}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#e4ecf8] text-[#1d4a8c]">{a.sitio}</span>
          </div>
          <div className="text-[15px] font-semibold">{a.proceso}</div>
          <div className="text-sm md:text-[13px] text-[#3c4849] leading-[1.5]">{a.descripcion}</div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-xl whitespace-nowrap" style={{ background: c[0], color: c[1] }}>{label}</span>
      </div>
      {editable && (
        <div className="flex gap-2 flex-wrap">
          <button disabled={busy} onClick={() => act({ estado: "ok", motivo: "" }, `Ejecutado: ${a.proceso} · ${a.sitio}`)} className={btn(st === "ok", "bg-[#2a64b8] text-white border-[#2a64b8]", "bg-white text-[#1d4a8c] border-[#2a64b8] hover:bg-[#eaf1fb]")}>✓ Ejecutado</button>
          <button disabled={busy} onClick={() => act({ estado: "no" }, `No ejecutado: ${a.proceso} · ${a.sitio}`)} className={btn(st === "no", "bg-[#b9574a] text-white border-[#b9574a]", "bg-white text-[#9b3b2e] border-[#b9574a] hover:bg-[#f6e4e0]")}>✕ No ejecutado</button>
          {a.tipo === "c" && <button disabled={busy} onClick={() => act({ estado: "na", motivo: "" }, `No ocurrió: ${a.proceso}`)} className={btn(st === "na", "bg-[#5b6667] text-white border-[#5b6667]", "bg-white text-[#5b6667] border-[#9aa5a6] hover:bg-[#eef1f1]")}>No ocurrió</button>}
        </div>
      )}
      {st === "ok" && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#f4f7fc]">
          <ControlChips value={e.controles} editable={editable && !busy} onChange={(controles) => act({ controles }, null)} />
          <EvidenceList items={e.evidencias} editable={editable} onAdd={(f) => onSet({ evidencias: [...(e.evidencias || []), ...f] }, `Evidencia adjunta (${f.length}) · ${a.proceso}`)}
            onRemove={(i) => act({ evidencias: e.evidencias.filter((_, j) => j !== i) }, `Evidencia eliminada · ${a.proceso}`)} />
          <textarea value={obs} onChange={(ev) => setObs(ev.target.value)} {...obsProps} disabled={!editable} placeholder="Observaciones (opcional)" rows={2} className="w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white resize-y focus:outline-none focus:border-[#2a64b8]" />
        </div>
      )}
      {st === "no" && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#fbf6f4]">
          <span className="text-xs text-[#9b3b2e] font-medium">Motivo (obligatorio)</span>
          <div className="flex gap-1.5 flex-wrap">
            {MOT.map((m) => (
              <button key={m} disabled={!editable || busy} onClick={() => act({ motivo: m }, null)} className={"text-sm md:text-[13px] px-3 py-2.5 md:py-1.5 rounded-[14px] border transition-colors " + (e.motivo === m ? "bg-[#b9574a] border-[#b9574a] text-white" : "bg-white border-[#e3c9c3] text-[#1c2526] hover:border-[#b9574a]")}>{m}</button>
            ))}
          </div>
          <textarea value={obs} onChange={(ev) => setObs(ev.target.value)} {...obsProps} disabled={!editable} placeholder="Detalle (opcional)" rows={2} className="w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white resize-y focus:outline-none focus:border-[#b9574a]" />
        </div>
      )}
    </div>
  );
}