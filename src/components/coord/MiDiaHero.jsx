import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sun, Sunset, Moon } from "lucide-react";
import Prevencionista from "@/components/coord/Prevencionista";

const saludo = (h) => (h >= 6 && h < 12 ? ["Buenos días", Sun] : h >= 12 && h < 20 ? ["Buenas tardes", Sunset] : ["Buenas noches", Moon]);

const Stat = ({ n, l, warn }) => (
  <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
    <div className={"font-mono text-2xl " + (warn ? "text-[#ffb4a8]" : "text-white")}>{n}</div>
    <div className="text-[11px] text-[#c5d5ea] mt-0.5">{l}</div>
  </div>
);

// Cabecera propia del espacio de Coordinación: saludo según la hora, resumen del día y el prevencionista animado.
export default function MiDiaHero({ user, eventos, hechos, abiertas, vencidas }) {
  const ahora = new Date();
  const [texto, Icon] = saludo(ahora.getHours());
  const nombre = (user?.full_name || "").split(" ")[0];
  const resumen = !eventos && !abiertas ? "Tienes el día despejado. Buen momento para avanzar en tus pendientes."
    : `Hoy tienes ${eventos} actividad${eventos === 1 ? "" : "es"} agendada${eventos === 1 ? "" : "s"} y ${abiertas} tarea${abiertas === 1 ? "" : "s"} abierta${abiertas === 1 ? "" : "s"}.`;
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(120deg,#16386a_0%,#1f4c8c_55%,#2a64b8_100%)] text-white px-5 md:px-8 py-6 md:py-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-[#9cc0f0]/15 blur-2xl" aria-hidden="true" />
      <div className="absolute right-40 -bottom-24 w-56 h-56 rounded-full bg-[#e3c77a]/10 blur-2xl" aria-hidden="true" />
      <div className="relative flex items-end gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[.14em] text-[#9cc0f0] uppercase">
              <Icon className="w-4 h-4 text-[#e3c77a]" /> Espacio de coordinación · {format(ahora, "EEEE d 'de' MMMM", { locale: es })}
            </span>
            <h2 className="font-heading text-[30px] md:text-[40px] leading-[1.05]">{texto}{nombre ? `, ${nombre}` : ""}</h2>
            <p className="text-sm text-[#c5d5ea] max-w-md">{resumen}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-[560px]">
            <Stat n={eventos} l="Actividades hoy" />
            <Stat n={hechos} l="Realizadas" />
            <Stat n={abiertas} l="Tareas abiertas" />
            <Stat n={vencidas} l="Vencidas" warn={vencidas > 0} />
          </div>
        </div>
        <Prevencionista className="hidden sm:block w-[150px] md:w-[190px] flex-none -mb-3" />
      </div>
    </div>
  );
}