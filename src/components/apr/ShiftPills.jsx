import { SH, ORDER, kpi } from "@/lib/apr";

export default function ShiftPills({ day, shift, setShift }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 w-full md:flex md:flex-wrap md:gap-2 md:w-auto">
      {ORDER.map((x) => {
        const p = day.plans[x];
        const k = kpi(p, day.execs, day.catalog);
        const cur = x === shift;
        const closed = p?.estado === "cerrada";
        const pub = p?.estado === "publicada";
        const status = closed ? "Cerrado · " + k.pct + "%" : !pub ? "Sin programar" : "En curso · " + (k.prog - k.pend) + "/" + k.prog;
        const dot = closed || pub ? "#00abac" : "#c49a1c";
        return (
          <button key={x} onClick={() => setShift(x)} className={"flex flex-col items-start gap-0.5 px-2.5 py-2 md:px-3.5 md:py-[9px] rounded-[10px] border min-w-0 md:min-w-[176px] shadow-[0_1px_2px_rgba(14,42,43,.06)] transition-all " + (cur ? "bg-[#0e2a2b] text-[#e6efee] border-[#0e2a2b]" : "bg-white text-[#1c2526] border-[#dde5e4] hover:border-[#007f80]")}>
            <span className="flex items-baseline gap-2 whitespace-nowrap"><span className="text-[13px] md:text-sm font-semibold">{SH[x].name}</span><span className="hidden md:inline font-mono text-xs opacity-75">{SH[x].hours}</span></span>
            <span className="flex items-center gap-1.5 text-[10px] md:text-xs leading-tight text-left"><span className="w-[7px] h-[7px] rounded flex-none" style={{ background: dot }} />{status}</span>
          </button>
        );
      })}
    </div>
  );
}