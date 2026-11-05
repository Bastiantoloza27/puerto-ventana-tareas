import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { card, MINS } from "@/lib/apr";

export default function MinimosResumen({ mes, asesor }) {
  const { data: recs = [] } = useQuery({ queryKey: ["mins", mes, asesor || "all"], queryFn: async () => (await base44.entities.MinimoMensual.filter(asesor ? { mes, asesor } : { mes }, { limit: 50 })).items });
  const n = Math.max(1, asesor ? 1 : recs.length);
  return (
    <div className={card + " p-4 flex flex-col gap-2.5"}>
      <div><div className="font-heading text-xl">Mínimos del mes</div><div className="text-xs text-[#6b7778]">{asesor || "Promedio por asesor"}</div></div>
      {MINS.filter((m) => m[2]).map(([f, l, m]) => {
        const v = Math.round(recs.reduce((s, r) => s + (r[f] || 0), 0) / n);
        return (
          <div key={f} className="flex flex-col gap-1">
            <div className="flex justify-between text-[13px]"><span>{l}</span><span className="font-mono">{v}/{m}</span></div>
            <div className="h-1.5 rounded bg-[#eef1f1] overflow-hidden"><motion.div className="h-full rounded bg-[#2a64b8]" initial={{ width: 0 }} animate={{ width: Math.min(100, (v / m) * 100) + "%" }} transition={{ duration: 1 }} /></div>
          </div>
        );
      })}
    </div>
  );
}