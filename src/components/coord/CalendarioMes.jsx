import { eachDayOfInterval, format, getDay, isSameMonth } from "date-fns";
import { card } from "@/lib/apr";
import CalDia from "@/components/coord/CalDia";

const DN = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const fmt = (d) => format(d, "yyyy-MM-dd");

export default function CalendarioMes({ ini, fin, mes, eventos, onAdd, onOpen }) {
  const dias = eachDayOfInterval({ start: ini, end: fin });
  const hoyCol = isSameMonth(new Date(), mes) ? (getDay(new Date()) + 6) % 7 : -1;
  return (
    <div className={card + " overflow-hidden max-h-[800px] overflow-y-auto min-[1100px]:max-h-none min-[1100px]:overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-700"}>
      <div className="hidden min-[1100px]:grid grid-cols-7 border-b border-[#dde5e4]" aria-hidden="true">
        {DN.map((d, i) => (
          <p key={d} style={{ animationDelay: 150 + i * 40 + "ms" }} className={"h-[60px] flex items-center px-4 font-heading text-2xl border-r last:border-r-0 border-[#dde5e4] animate-in fade-in fill-mode-both duration-500 " + (i === hoyCol ? "text-[#16386a]" : "text-[#b9c5d4]")}>{d}</p>
        ))}
      </div>
      <div className="min-[1100px]:grid grid-cols-7">
        {dias.map((d, i) => (
          <CalDia key={fmt(d)} d={d} fecha={fmt(d)} fuera={!isSameMonth(d, mes)} hoyCol={i % 7 === hoyCol} col={i % 7} row={Math.floor(i / 7)}
            eventos={eventos.filter((e) => e.fecha === fmt(d))} onAdd={onAdd} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}