import { useEffect, useRef, useState } from "react";
import { card, MOT, now } from "@/lib/apr";
import { corto, marcar } from "@/lib/vigilantes";
import { attempt } from "@/lib/safe";
import EvidenceList from "@/components/apr/EvidenceList";

const CHIP = { ok: ["#e4ecf8", "#1d4a8c", "#3b82d0"], no: ["#f6e4e0", "#9b3b2e", "#b9574a"], none: ["#fbf3dc", "#7a5d0e", "#e3c77a"] };
const ETQ = { inicio: "Inicio del turno", durante: "Durante el turno", final: "Término del turno", mes: "Una vez al mes", manual: "Asignada por Jefatura" };

// "Recepción de turno: indicar..." → título y descripción, igual que las actividades de asesores.
function partes(t) {
  const i = t.tarea.indexOf(":");
  if (!t.descripcion && i > 0 && i < 70) return [t.tarea.slice(0, i), t.tarea.slice(i + 1).trim()];
  return [t.tarea, t.descripcion || ""];
}

export default function VigTareaCard({ item, ctx, editable, onSaved }) {
  const { t, reg: e } = item;
  const st = e?.estado;
  const [obs, setObs] = useState(e?.observaciones || "");
  const [busy, setBusy] = useState(false);
  const focused = useRef(false);
  const save = (data) => attempt(async () => { await marcar({ reg: e, t, ...ctx }, data); await onSaved(); }, null, "No se pudo guardar");
  useEffect(() => { if (!focused.current) setObs(e?.observaciones || ""); }, [e?.observaciones]);
  useEffect(() => {
    if (!editable || !e || obs === (e.observaciones || "")) return;
    const id = setTimeout(() => save({ observaciones: obs }), 1200);
    return () => clearTimeout(id);
  }, [obs]);
  const act = async (data) => { if (busy) return; setBusy(true); await save(data); setBusy(false); };
  const [titulo, desc] = partes(t);
  const c = CHIP[st || "none"];
  const label = st === "ok" ? "Ejecutado · " + (e.hora || "") : st === "no" ? "No ejecutado" + (e.motivo ? "" : " · falta motivo") : "Por registrar";
  const btn = (on, onCls, offCls) => "flex-1 md:flex-none min-h-[44px] md:min-h-0 px-3.5 py-2.5 md:py-2 rounded-md text-sm md:text-[13px] border transition-colors " + (on ? onCls : offCls);
  const obsProps = { value: obs, onChange: (ev) => setObs(ev.target.value), disabled: !editable, rows: 2, onFocus: () => { focused.current = true; }, onBlur: () => { focused.current = false; } };
  const ta = "w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white resize-y focus:outline-none ";
  const evid = <EvidenceList items={e?.evidencias} editable={editable} onAdd={(f) => act({ evidencias: [...(e?.evidencias || []), ...f] })} onRemove={(i) => act({ evidencias: e.evidencias.filter((_, j) => j !== i) })} />;
  const aviso = st && !(e.evidencias || []).length && !obs.trim() && <span className="text-xs text-[#7a5d0e] bg-[#fbf3dc] rounded px-2 py-1 self-start">Falta una foto o una observación</span>;
  const atrasada = t.desde && Number(ctx.fecha.slice(8, 10)) > t.desde;

  return (
    <div className={card + " border-l-4 px-4 py-3.5 flex flex-col gap-2.5"} style={{ borderLeftColor: c[2] }}>
      <div className="flex justify-between gap-2.5 items-start flex-wrap">
        <div className="flex flex-col gap-[5px] min-w-0 flex-[1_1_320px]">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#eef3f3] text-[#3c4849]">{corto(ctx.puesto)}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#e4ecf8] text-[#1d4a8c]">{ETQ[t.grupo]}</span>
            {atrasada && <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#fbf3dc] text-[#7a5d0e]">Le tocaba el día {t.desde}</span>}
          </div>
          <div className="text-[15px] font-semibold">{titulo}</div>
          {desc && <div className="text-sm md:text-[13px] text-[#3c4849] leading-[1.5]">{desc}</div>}
          {t.evidencia && <div className="text-xs text-[#6b7778]">Respaldo: {t.evidencia}</div>}
        </div>
        <span className="text-xs px-2.5 py-1 rounded-xl whitespace-nowrap" style={{ background: c[0], color: c[1] }}>{label}</span>
      </div>
      {editable && (
        <div className="flex gap-2 flex-wrap">
          <button disabled={busy} onClick={() => act({ estado: "ok", motivo: "", hora: now() })} className={btn(st === "ok", "bg-[#2a64b8] text-white border-[#2a64b8]", "bg-white text-[#1d4a8c] border-[#2a64b8] hover:bg-[#eaf1fb]")}>✓ Ejecutado</button>
          <button disabled={busy} onClick={() => act({ estado: "no", hora: now() })} className={btn(st === "no", "bg-[#b9574a] text-white border-[#b9574a]", "bg-white text-[#9b3b2e] border-[#b9574a] hover:bg-[#f6e4e0]")}>✕ No ejecutado</button>
        </div>
      )}
      {st === "ok" && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#f4f7fc]">
          {evid}
          <textarea {...obsProps} placeholder="Observación (obligatoria si no adjuntas foto)" className={ta + "focus:border-[#2a64b8]"} />
          {aviso}
        </div>
      )}
      {st === "no" && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#fbf6f4]">
          <span className="text-xs text-[#9b3b2e] font-medium">Motivo (obligatorio)</span>
          <div className="flex gap-1.5 flex-wrap">
            {MOT.map((m) => <button key={m} disabled={!editable || busy} onClick={() => act({ motivo: m })} className={"text-sm md:text-[13px] px-3 py-2.5 md:py-1.5 rounded-[14px] border transition-colors " + (e.motivo === m ? "bg-[#b9574a] border-[#b9574a] text-white" : "bg-white border-[#e3c9c3] text-[#1c2526] hover:border-[#b9574a]")}>{m}</button>)}
          </div>
          <textarea {...obsProps} placeholder="Detalle (obligatorio si no adjuntas foto)" className={ta + "focus:border-[#b9574a]"} />
          {evid}
          {aviso}
        </div>
      )}
    </div>
  );
}