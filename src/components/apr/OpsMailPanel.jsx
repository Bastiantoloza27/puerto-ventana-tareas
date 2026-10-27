import { Mail } from "lucide-react";
import { card } from "@/lib/apr";
import PasteMailBox from "@/components/apr/PasteMailBox";

export default function OpsMailPanel({ plan, catalog, ids, onApply, locked, onParsed }) {
  const m = plan?.correo;
  const name = (id) => { const a = catalog.find((c) => c.id === id); return a ? `${a.proceso} · ${a.sitio}` : ""; };
  const sug = new Set(catalog.filter((c) => c.base).map((c) => c.id));
  (m?.lineas || []).forEach((l) => l.actividad_id && sug.add(l.actividad_id));
  if (m?.actualizacion?.actividad_id) sug.add(m.actualizacion.actividad_id);
  const missing = [...sug].filter((id) => !ids.includes(id));

  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-[#e2f4f4] text-[#007f80] grid place-items-center flex-none"><Mail className="w-4 h-4" /></span>
        <div className="min-w-0"><div className="font-heading text-xl leading-tight">Correo de Operaciones</div>
          <div className="text-xs text-[#6b7778]">{m ? <>Recibido a las <span className="font-mono">{m.hora}</span> · {m.asunto}</> : "Aún no llega el correo de este turno"}</div></div>
      </div>
      {(m?.lineas || []).map((l, i) => (
        <div key={i} className="text-[13px] border-b border-[#eef1f1] pb-2 last:border-0">
          <div className="text-[#1c2526]">{l.texto}</div>
          <div className={"text-xs mt-0.5 " + (l.actividad_id ? "text-[#005f60]" : "text-[#7a5d0e] bg-[#fbf3dc] rounded px-1.5 py-0.5 inline-block")}>{l.actividad_id ? "→ " + name(l.actividad_id) + (ids.includes(l.actividad_id) ? " ✓" : "") : "⚠ Sin actividad del catálogo · agrégala a mano si corresponde"}</div>
        </div>
      ))}
      {m?.actualizacion && (
        <div className="rounded-lg bg-[#fbf3dc] border border-[#c9b98a] px-3 py-2.5 text-[13px] text-[#7a5d0e]">
          <div className="font-mono text-[11px] tracking-[.08em] mb-0.5">ACTUALIZACIÓN · {m.actualizacion.hora}</div>
          {m.actualizacion.texto}
        </div>
      )}
      {!locked && onParsed && <PasteMailBox isUpdate={!!m} onParsed={onParsed} />}
      {!locked && (
        <button disabled={!missing.length} onClick={() => onApply(missing)} className="px-4 py-2.5 rounded-md text-sm border border-[#007f80] text-[#005f60] bg-white hover:bg-[#e8f5f5] disabled:opacity-50 disabled:hover:bg-white transition-colors">
          {missing.length ? `Aplicar sugerencias (+${missing.length})` : "Sugerencias aplicadas"}
        </button>
      )}
    </div>
  );
}