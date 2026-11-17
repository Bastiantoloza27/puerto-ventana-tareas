export default function Progreso({ a, big }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={(big ? "h-4" : "h-2.5") + " rounded-full bg-[#e3e9f1] overflow-hidden flex"}>
        <div className="bg-[#2e8b57] transition-all duration-500" style={{ width: (a.total ? (a.ok / a.total) * 100 : 0) + "%" }} />
        <div className="bg-[#c0392b] transition-all duration-500" style={{ width: (a.total ? (a.no / a.total) * 100 : 0) + "%" }} />
      </div>
      <div className={"flex gap-3 text-[#5b6b80] " + (big ? "text-sm" : "text-xs")}>
        <span><b className="text-[#1f6b40]">{a.ok}</b> hechas</span>
        <span><b className="text-[#9b2c1f]">{a.no}</b> no se pudo</span>
        <span><b className="text-[#16386a]">{a.pend}</b> pendientes</span>
      </div>
    </div>
  );
}