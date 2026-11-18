import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sun, Sunset, Moon } from "lucide-react";
import PortScene from "@/components/inicio/PortScene";
import SimbolosPrevencion from "@/components/coord/SimbolosPrevencion";

const saludo = (h) => (h >= 6 && h < 12 ? ["Buenos días", Sun] : h >= 12 && h < 20 ? ["Buenas tardes", Sunset] : ["Buenas noches", Moon]);

const Stat = ({ n, l, warn }) => (
  <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
    <div className={"font-mono text-2xl " + (warn ? "text-[#ffb4a8]" : "text-white")}>{n}</div>
    <div className="text-[11px] text-[#c5d5ea] mt-0.5">{l}</div>
  </div>
);

// Cabecera del espacio de Coordinación: saludo según la hora, resumen del día, mar en movimiento y símbolos de prevención.
export default function MiDiaHero({ user, eventos, hechos, abiertas, vencidas }) {
  const ahora = new Date();
  const h = ahora.getHours();
  const [texto, Icon] = saludo(h);
  const nombre = (user?.full_name || "").split(" ")[0];
  const resumen = !eventos && !abiertas ? "Tienes el día despejado. Buen momento para avanzar en tus pendientes."
    : `Hoy tienes ${eventos} actividad${eventos === 1 ? "" : "es"} agendada${eventos === 1 ? "" : "s"} y ${abiertas} tarea${abiertas === 1 ? "" : "s"} abierta${abiertas === 1 ? "" : "s"}.`;
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(115deg,#0f2340_0%,#16386a_55%,#2a64b8_100%)] text-white px-5 md:px-8 pt-6 md:pt-7 pb-10 md:pb-12 shadow-[0_10px_30px_rgba(0,0,0,.25)] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PortScene night={h >= 20 || h < 6} />
      <SimbolosPrevencion />
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[.14em] text-[#9cc0f0] uppercase">
            <Icon className="w-4 h-4 text-[#e3c77a] flex-none" /> Espacio de coordinación · {format(ahora, "EEEE d 'de' MMMM", { locale: es })}
          </span>
          <h2 className="font-heading text-[30px] md:text-[40px] leading-[1.05]">{texto}{nombre ? `, ${nombre}` : ""}</h2>
          <p className="text-sm text-[#d6e2f5] max-w-md">{resumen}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-[560px]">
          <Stat n={eventos} l="Actividades hoy" />
          <Stat n={hechos} l="Realizadas" />
          <Stat n={abiertas} l="Tareas abiertas" />
          <Stat n={vencidas} l="Vencidas" warn={vencidas > 0} />
        </div>
      </div>
    </div>
  );
}