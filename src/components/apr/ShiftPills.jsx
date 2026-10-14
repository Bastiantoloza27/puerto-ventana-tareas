import { SH, ORDER, kpi } from "@/lib/apr";

export default function ShiftPills({ day, shift, setShift }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ORDER.map((x) => {
        const p = day.plans[x];
        const k = kpi(p, day.execs, day.catalog);
        const cur = x === shift;
        const closed = p?.estado === "cerrada";
        const pub = p?.estado === "publicada";
        const status = closed ? "Cerrado · " + k.pct + "%" : !pub ? "Sin programar" : "En curso · " + (k.prog - k.pend) + "/" + k.prog;
        const dot = closed || pub ? "#00abac" : "#c49a1c";
        return (
          <button key={x} onClick={() => setShift(x)} className={"flex flex-col items-start gap-0.5 px-3.5 py-[9px] rounded-[10px] border min-w-[176px] shadow-[0_1px_2px_rgba(14,42,43,.06)] transition-all " + (cur ? "bg-[#0e2a2b] text-[#e6efee] border-[#0e2a2b]" : "bg-white text-[#1c2526] border-[#dde5e4] hover:border-[#007f80]")}>
            <span className="flex items-baseline gap-2 whitespace-nowrap"><span className="text-sm font-semibold">{SH[x].name}</span><span className="font-mono text-xs opacity-75">{SH[x].hours}</span></span>
            <span className="flex items-center gap-1.5 text-xs"><span className="w-[7px] h-[7px] rounded" style={{ background: dot }} />{status}</span>
          </button>
        );
      })}
    </div>
  );
}