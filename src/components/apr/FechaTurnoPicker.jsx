import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { History } from "lucide-react";
import { card, turnoActual } from "@/lib/apr";

// Jefatura: revisar cualquier día anterior en Mi turno y Cierre.
export default function FechaTurnoPicker({ value, onChange, onReset }) {
  const actual = turnoActual().fecha;
  return (
    <div className={card + " p-3 flex items-center gap-3 flex-wrap"}>
      <History className="w-5 h-5 text-[#2a64b8]" />
      <span className="text-sm text-[#3c4849]">Revisar el día</span>
      <input type="date" max={actual} value={value} onChange={(e) => onChange(e.target.value || actual)}
        className="min-h-[44px] md:min-h-0 text-sm px-2.5 py-1.5 rounded-md border border-[#cdd4d4] bg-white" />
      {value !== actual && (
        <>
          <span className="text-xs px-2.5 py-1 rounded-xl bg-[#fbf3dc] text-[#7a5d0e]">Revisando el {format(parseISO(value), "EEEE dd-MM", { locale: es })}</span>
          <button onClick={onReset} className="text-xs text-[#16386a] underline">Volver al turno en curso</button>
        </>
      )}
    </div>
  );
}