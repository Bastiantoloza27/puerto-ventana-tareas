import { ShieldCheck } from "lucide-react";

const ITEMS = ["SOC 2 Tipo II", "ISO 27001", "GDPR", "Datos cifrados"];

export default function SecurityBadges({ compact }) {
  if (compact) {
    return (
      <div className="flex items-start gap-1.5 text-[10px] leading-snug text-[#6f9493]">
        <ShieldCheck className="w-3.5 h-3.5 flex-none text-[#7fd6d6]" />
        <span>{ITEMS.join(" · ")}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-1.5 max-w-[320px]">
      {ITEMS.map((t) => (
        <span key={t} className="flex items-center gap-1 font-mono text-[10px] tracking-[.06em] text-[#a9c1c0] border border-[#1f4344] rounded-full px-2.5 py-1">
          <ShieldCheck className="w-3 h-3 text-[#7fd6d6]" />{t}
        </span>
      ))}
    </div>
  );
}