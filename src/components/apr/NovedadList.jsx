import { card, CRIT } from "@/lib/apr";
import EvidenceList from "@/components/apr/EvidenceList";

export default function NovedadList({ novs }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-2"><span className="text-base font-semibold">Novedades del turno</span><span className="font-mono text-[13px] text-[#6b7778]">{novs.length}</span></div>
      {!novs.length && <div className={card + " p-5 text-sm text-[#6b7778]"}>Sin novedades registradas en este turno.</div>}
      {novs.map((n) => (
        <div key={n.id} className={card + " px-4 py-3.5 flex flex-col gap-1.5"}>
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="font-mono text-xs text-[#6b7778]">{n.hora}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#e2f4f4] text-[#005f60]">{n.lugar}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#eef3f3] text-[#3c4849]">{n.tipo}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-[10px]" style={{ background: CRIT[n.criticidad]?.[0], color: CRIT[n.criticidad]?.[1] }}>{n.criticidad}</span>
          </div>
          <div className="text-sm">{n.descripcion}</div>
          {n.quien && <div className="text-xs text-[#3c4849]"><span className="text-[#6b7778]">Quién estuvo:</span> {n.quien}</div>}
          {n.accion && <div className="text-xs text-[#3c4849]"><span className="text-[#6b7778]">Acción inmediata:</span> {n.accion}</div>}
          {(n.evidencias || []).length > 0 && <EvidenceList items={n.evidencias} />}
        </div>
      ))}
    </div>
  );
}