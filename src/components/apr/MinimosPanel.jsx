import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { card, MINS } from "@/lib/apr";

export default function MinimosPanel({ asesor, fecha, readOnly }) {
  const mes = fecha.slice(0, 7);
  const qc = useQueryClient();
  const key = ["mins", mes, asesor];
  const { data: rec } = useQuery({ queryKey: key, enabled: !!asesor, queryFn: async () => (await base44.entities.MinimoMensual.filter({ mes, asesor }, { limit: 1 })).items[0] || null });
  const add = async (f, d = 1) => {
    if (rec) await base44.entities.MinimoMensual.update(rec.id, { [f]: Math.max(0, (rec[f] || 0) + d) });
    else if (d > 0) await base44.entities.MinimoMensual.create({ mes, asesor, [f]: 1 });
    qc.invalidateQueries({ queryKey: key });
  };
  if (!asesor) return null;
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div><div className="font-heading text-xl">Mínimos del mes</div><div className="text-xs text-[#6b7778]">Programa personalizado · {asesor}</div></div>
      {MINS.map(([f, l, m, ver]) => {
        const v = rec?.[f] || 0;
        return (
          <div key={f} className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-[13px] font-medium">{l}</span>
              <span className="flex items-center gap-2"><span className="font-mono text-xs text-[#3c4849]">{m ? `${v}/${m}` : `${v} este mes`}</span>
                {!readOnly && <button onClick={() => add(f, -1)} disabled={!v} aria-label={"Restar " + l} className="font-mono text-xs md:text-[11px] w-9 h-9 md:w-6 md:h-6 rounded-md border border-[#cdd4d4] hover:border-[#b9574a] hover:text-[#b9574a] disabled:opacity-40">−1</button>}
                {!readOnly && <button onClick={() => add(f)} className="font-mono text-xs md:text-[11px] w-9 h-9 md:w-6 md:h-6 rounded-md border border-[#cdd4d4] hover:border-[#007f80] hover:text-[#007f80]">+1</button>}</span>
            </div>
            <div className="h-1.5 rounded bg-[#eef1f1] overflow-hidden"><div className="h-full rounded transition-all duration-500" style={{ width: m ? Math.min(100, (v / m) * 100) + "%" : "100%", background: m ? (v >= m ? "#00abac" : "#007f80") : "#cdd4d4" }} /></div>
            <span className="text-[11px] text-[#6b7778]">{ver}</span>
          </div>
        );
      })}
    </div>
  );
}