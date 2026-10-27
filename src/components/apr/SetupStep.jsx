import { Link } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { card } from "@/lib/apr";

export default function SetupStep({ n, title, desc, detail, done, to, cta, onConfirm }) {
  return (
    <div className={card + " p-4 md:p-5 flex gap-4 items-start " + (done ? "opacity-80" : "")}>
      {done ? <CheckCircle2 className="w-6 h-6 text-[#00abac] flex-none mt-0.5" /> : <Circle className="w-6 h-6 text-[#cdd4d4] flex-none mt-0.5" />}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="font-mono text-[11px] text-[#007f80] tracking-[.08em]">PASO {n}</div>
        <div className="font-heading text-xl leading-tight">{title}</div>
        <div className="text-sm text-[#6b7778]">{desc}</div>
        {detail && <div className="text-xs font-mono text-[#3c4849]">{detail}</div>}
        <div className="flex flex-wrap gap-2 mt-1.5">
          {to && <Link to={to} className="min-h-[44px] md:min-h-0 flex items-center px-4 py-2 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm">{cta}</Link>}
          {onConfirm && <button onClick={onConfirm} className="min-h-[44px] md:min-h-0 px-4 py-2 rounded-md border border-[#cdd4d4] hover:border-[#007f80] text-sm">{done ? "Marcar pendiente" : "Confirmar"}</button>}
        </div>
      </div>
    </div>
  );
}