import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { tipoCls, rango } from "@/lib/coord";

// Celda de día: eventos arriba, fecha abajo a la izquierda (en teléfono, fecha arriba).
export default function CalDia({ d, fecha, fuera, hoyCol, col, row, eventos, onAdd, onOpen }) {
  const vacio = !eventos.length;
  const delay = (k = 0) => ({ animationDelay: `${250 + row * 80 + col * 40 + k * 60}ms` });
  return (
    <div onClick={() => onAdd(fecha)} className={"group relative cursor-pointer flex flex-col border-b border-[#dde5e4] min-[1100px]:min-h-[131px] min-[1100px]:border-r min-[1100px]:[&:nth-child(7n)]:border-r-0 " + (fuera ? "bg-[#f1f4f8] " : "bg-white ") + (vacio ? "h-14 justify-center px-4 min-[1100px]:h-auto min-[1100px]:justify-start min-[1100px]:px-0" : "gap-4 px-4 py-3 min-[1100px]:gap-0 min-[1100px]:p-0")}>
      <p className="flex items-baseline gap-1.5 animate-in fade-in fill-mode-both duration-500 min-[1100px]:order-2 min-[1100px]:mt-auto min-[1100px]:p-2" style={delay(-1)}>
        <span className={"text-sm font-semibold uppercase min-[1100px]:sr-only " + (hoyCol ? "text-[#16386a]" : "text-[#9fb0c4]")}>{format(d, "EEE", { locale: es })}</span>
        <span className={"text-sm font-semibold font-mono " + (isToday(d) ? "text-white bg-[#2a64b8] rounded px-1.5" : fuera ? "text-[#9aa8b8]" : "text-[#3c4a5c]")}>{format(d, "dd")}</span>
      </p>
      {!vacio && (
        <ul className="flex flex-col gap-2 min-[1100px]:order-1 min-[1100px]:p-2">
          {eventos.map((e, k) => (
            <li key={e.id} className="animate-in fade-in slide-in-from-bottom-1 zoom-in-95 fill-mode-both duration-500" style={delay(k)}>
              <button onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}
                className={"w-full text-left rounded px-3 flex gap-1.5 justify-between items-center flex-wrap transition hover:brightness-95 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#16386a] " + tipoCls(e.tipo) + (k === 0 ? " min-h-[50px] py-3 min-[1100px]:flex-col min-[1100px]:items-start" : " min-h-[29px] py-2 items-baseline") + (e.estado === "completado" ? " opacity-60 line-through" : "")}>
                <span className="text-[12px] font-semibold uppercase tracking-tight leading-none break-words min-w-0">{e.titulo}</span>
                <span className="text-[12px] leading-tight whitespace-nowrap">{rango(e)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={(ev) => { ev.stopPropagation(); onAdd(fecha); }} aria-label={"Agregar evento el " + fecha}
        className={"absolute right-2.5 h-7 px-2 rounded inline-flex items-center gap-1 text-[12px] font-semibold uppercase text-[#2a64b8] hover:bg-[#e3e9f1] transition-opacity min-[1100px]:top-auto min-[1100px]:translate-y-0 min-[1100px]:bottom-0.5 min-[1100px]:right-1 min-[1100px]:w-[26px] min-[1100px]:h-[26px] min-[1100px]:p-0 min-[1100px]:justify-center min-[1100px]:opacity-0 min-[1100px]:group-hover:opacity-100 min-[1100px]:focus-visible:opacity-100 " + (vacio ? "top-1/2 -translate-y-1/2" : "top-[9px]")}>
        <Plus className="w-3.5 h-3.5" /><span className="min-[1100px]:hidden">Agregar</span>
      </button>
    </div>
  );
}