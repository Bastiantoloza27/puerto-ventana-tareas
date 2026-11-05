import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock } from "lucide-react";
import { card, today } from "@/lib/apr";

export default function ProgDatePicker({ value, onChange }) {
  const future = value > today();
  return (
    <div className={card + " p-3 flex items-center gap-3 flex-wrap"}>
      <CalendarClock className="w-5 h-5 text-[#2a64b8]" />
      <span className="text-sm text-[#3c4849]">Programar para el día</span>
      <input type="date" min={today()} value={value} onChange={(e) => onChange(e.target.value || today())}
        className="min-h-[44px] md:min-h-0 text-sm px-2.5 py-1.5 rounded-md border border-[#cdd4d4] bg-white" />
      {value !== today() && <button onClick={() => onChange(today())} className="text-xs text-[#16386a] underline">Volver a hoy</button>}
      {future && (
        <span className="text-xs px-2.5 py-1 rounded-xl bg-[#e2f4f4] text-[#16386a]">
          Se habilita al asesor el {format(parseISO(value), "EEEE dd-MM", { locale: es })}
        </span>
      )}
    </div>
  );
}