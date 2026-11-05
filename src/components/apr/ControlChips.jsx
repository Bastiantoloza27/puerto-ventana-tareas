import { MINS } from "@/lib/apr";

const SHORT = { charlas: "Charla", conducta: "Conducta", inspeccion: "Inspección", epp: "EPP", cuasi: "Cuasi-accidente" };

export default function ControlChips({ value = [], editable, onChange }) {
  const toggle = (f) => onChange(value.includes(f) ? value.filter((x) => x !== f) : [...value, f]);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-[#1d4a8c] font-medium">¿Qué realizaste? · suma a tus mínimos del mes</span>
      <div className="flex gap-1.5 flex-wrap">
        {MINS.map(([f]) => (
          <button key={f} disabled={!editable} onClick={() => toggle(f)} className={"text-sm md:text-[13px] px-3 py-2.5 md:py-1.5 rounded-[14px] border transition-colors " + (value.includes(f) ? "bg-[#2a64b8] border-[#2a64b8] text-white" : "bg-white border-[#cdd9ec] text-[#1c2526] hover:border-[#2a64b8]")}>{SHORT[f]}</button>
        ))}
      </div>
    </div>
  );
}