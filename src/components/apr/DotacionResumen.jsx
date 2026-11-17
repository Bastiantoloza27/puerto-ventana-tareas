import { Users } from "lucide-react";
import { card } from "@/lib/apr";

// rows: [{ id, label, personas, nombrada }]
export default function DotacionResumen({ rows }) {
  if (!rows.length) return null;
  const total = rows.reduce((s, r) => s + (r.personas || 0), 0);
  return (
    <div className={card + " p-4 flex flex-col gap-2"}>
      <div className="flex justify-between items-baseline gap-2 flex-wrap">
        <span className="font-heading text-xl">Personal por actividad</span>
        <span className="text-xs text-[#6b7778] flex items-center gap-1"><Users className="w-3.5 h-3.5" /><b className="font-mono text-[#16386a]">{total}</b> personas registradas</span>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="flex justify-between gap-3 text-[13px] border-b border-[#eef1f1] pb-1.5 last:border-0">
          <span className="text-[#3c4849] min-w-0">{r.label}</span>
          <span className="font-mono whitespace-nowrap">{r.personas ?? <span className="text-[#b08a2a]">sin dato</span>}{r.nombrada && <span className="text-[11px] text-[#6b7778] font-body"> · nombrada</span>}</span>
        </div>
      ))}
    </div>
  );
}