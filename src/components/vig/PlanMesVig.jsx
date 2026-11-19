import { card } from "@/lib/apr";
import { mensuales, diaMes } from "@/lib/vigilantes";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Calendario fijo de las tareas mensuales: qué día le toca a cada turno.
export default function PlanMesVig({ v, puesto, fecha }) {
  const lista = mensuales(v.matriz, puesto);
  if (!lista.length) return null;
  return (
    <div className={card + " p-4 flex flex-col gap-2.5"}>
      <span className="font-heading text-lg">Tareas del mes · {MESES[Number(fecha.slice(5, 7)) - 1]}</span>
      <span className="text-xs text-[#6b7778]">Aparecen solas en el turno el día que le toca. Si no se hace, sigue pendiente en ese turno hasta fin de mes.</span>
      {lista.map((t) => (
        <div key={t.id} className="flex flex-col gap-1 border-t border-[#eef1f1] pt-2">
          <span className="text-sm">{t.tarea}</span>
          <div className="flex gap-1.5 flex-wrap">
            {["T1", "T2", "T3"].map((tr) => {
              const d = diaMes(t, tr, lista);
              return d && <span key={tr} className="text-[11px] px-2 py-0.5 rounded-[10px] bg-[#e4ecf8] text-[#1d4a8c]">{tr} · día {d}</span>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}