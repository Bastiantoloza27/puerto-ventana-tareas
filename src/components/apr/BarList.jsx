import { card } from "@/lib/apr";

export default function BarList({ title, rows, suffix = "", max }) {
  const top = max || Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className={card + " p-4 flex flex-col gap-3 flex-[1_1_340px] min-w-0"}>
      <div className="font-heading text-xl">{title}</div>
      {!rows.length && <div className="text-sm text-[#6b7778]">Sin datos este mes.</div>}
      {rows.map(([l, v]) => (
        <div key={l} className="flex flex-col gap-1">
          <div className="flex justify-between text-[13px]"><span>{l}</span><span className="font-mono text-[#3c4849]">{v}{suffix}</span></div>
          <div className="h-1.5 rounded bg-[#eef1f1] overflow-hidden"><div className="h-full rounded bg-[#007f80] transition-all duration-700" style={{ width: (v / top) * 100 + "%" }} /></div>
        </div>
      ))}
    </div>
  );
}