import { motion } from "framer-motion";
import { card, ORDER, SH, kpi } from "@/lib/apr";

export default function TurnosHoy({ day }) {
  return (
    <div className={card + " p-4 flex flex-col"}>
      <div className="flex justify-between items-baseline pb-3 border-b border-[#eef1f1]"><span className="font-heading text-xl">Turnos de hoy</span><span className="text-xs text-[#6b7778]">Avance de registro</span></div>
      {ORDER.map((t) => {
        const p = day.plans[t];
        const pub = p && p.estado !== "borrador";
        const k = kpi(p, day.execs, day.catalog);
        const done = k.prog - k.pend;
        return (
          <div key={t} className="py-3 border-b border-[#eef1f1] last:border-0 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm"><span><b>{SH[t].name}</b> <span className="font-mono text-[#6b7778]">{SH[t].hours}</span> · {p?.asesor || "Sin asignar"}</span><span className="font-mono">{pub ? `${done}/${k.prog}` : "—"}</span></div>
            <div className="h-2 rounded bg-[#eef1f1] overflow-hidden"><motion.div className="h-full rounded bg-[#2a64b8]" initial={{ width: 0 }} animate={{ width: pub && k.prog ? (done / k.prog) * 100 + "%" : 0 }} transition={{ duration: 1 }} /></div>
            <span className="text-xs text-[#6b7778]">{!p ? "Pendiente de programar" : p.estado === "borrador" ? "En borrador" : p.estado === "cerrada" ? `Cerrado ${p.cerrada_hora || ""} · ${k.pct}% cumplimiento` : `Publicado ${p.publicada_hora || ""} · ${k.pend} por registrar`}</span>
          </div>
        );
      })}
    </div>
  );
}