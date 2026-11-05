import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export default function StatCard({ label, value, suffix = "", note }) {
  const [v, setV] = useState(0);
  useEffect(() => { const c = animate(0, value || 0, { duration: 1.1, onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [value]);
  return (
    <div className="bg-white border border-[#dde3ec] border-t-[3px] border-t-[#2a64b8] rounded-[10px] px-4 py-3.5 flex flex-col gap-1 shadow-[0_1px_2px_rgba(15,35,64,.05),0_6px_18px_rgba(15,35,64,.05)] hover:-translate-y-0.5 transition-transform">
      <span className="text-xs text-[#6b7778]">{label}</span>
      <span className="font-mono text-[28px] font-medium">{v}{suffix}</span>
      <span className="text-xs text-[#6b7778]">{note}</span>
    </div>
  );
}