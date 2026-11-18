import { base44 } from "@/api/base44Client";
import useLista from "@/hooks/useLista";
import { card, today } from "@/lib/apr";
import { attempt } from "@/lib/safe";
import { tipoCls, rango, EST_T } from "@/lib/coord";
import CorreoRecordatorio from "@/components/coord/CorreoRecordatorio";
import BitacoraDia from "@/components/coord/BitacoraDia";
import TurnosAsesores from "@/components/coord/TurnosAsesores";

import MiDiaHero from "@/components/coord/MiDiaHero";

export default function MiDia({ user, day, go }) {
  const hoy = today();
  const evs = useLista("EventoCoordinador", { created_by_id: user.id, fecha: hoy }, { sort: "hora_inicio", limit: 50 });
  const tareas = useLista("TareaCoordinador", { asignado_email: user.email.toLowerCase(), estado: { $ne: "completada" } }, { sort: "fecha_limite", limit: 100 });
  const venc = tareas.items.filter((t) => t.fecha_limite && t.fecha_limite < hoy).length;
  const toggle = (e) => attempt(async () => { await base44.entities.EventoCoordinador.update(e.id, { estado: e.estado === "completado" ? "pendiente" : "completado" }); evs.refresh(); }, null, "No se pudo actualizar");
  return (
    <div className="flex flex-col gap-4">
      <MiDiaHero user={user} eventos={evs.items.length} hechos={evs.items.filter((e) => e.estado === "completado").length} abiertas={tareas.items.length} vencidas={venc} />
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-4">
          <div className={card + " p-4 flex flex-col gap-2.5"}>
            <div className="flex justify-between items-center"><span className="font-heading text-lg">Agenda de hoy</span><button onClick={() => go("cal")} className="text-sm text-[#2a64b8] hover:underline">Ver calendario</button></div>
            {!evs.items.length && <span className="text-sm text-[#6b7778]">No tienes actividades agendadas hoy.</span>}
            {evs.items.map((e) => (
              <label key={e.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-[#f5f8fc] cursor-pointer">
                <input type="checkbox" checked={e.estado === "completado"} onChange={() => toggle(e)} className="w-4 h-4 accent-[#2a64b8]" />
                <span className="font-mono text-xs text-[#5b6b80] w-[84px]">{rango(e)}</span>
                <span className={"text-sm flex-1 " + (e.estado === "completado" ? "line-through text-[#6b7778]" : "")}>{e.titulo}{e.lugar ? <span className="text-xs text-[#5b6b80]"> · {e.lugar}</span> : null}</span>
                <span className={"w-2.5 h-2.5 rounded-full " + tipoCls(e.tipo)} />
              </label>
            ))}
          </div>
          <div className={card + " p-4 flex flex-col gap-2.5"}>
            <div className="flex justify-between items-center"><span className="font-heading text-lg">Tareas pendientes</span><button onClick={() => go("tareas")} className="text-sm text-[#2a64b8] hover:underline">Ver todas</button></div>
            {!tareas.items.length && <span className="text-sm text-[#6b7778]">Sin tareas abiertas.</span>}
            {tareas.items.slice(0, 5).map((t) => (
              <button key={t.id} onClick={() => go("tareas")} className="flex items-center gap-3 text-left rounded-md px-2 py-2 hover:bg-[#f5f8fc]">
                <span className={"text-[11px] px-2 py-0.5 rounded-full " + EST_T[t.estado]?.[1]}>{EST_T[t.estado]?.[0]}</span>
                <span className="text-sm flex-1 min-w-0 truncate">{t.titulo}</span>
                {t.origen === "jefatura" && <span className="text-[11px] text-[#46386e] bg-[#e7e2f3] rounded px-1.5">Jefatura</span>}
                {t.fecha_limite && <span className={"font-mono text-xs " + (t.fecha_limite < today() ? "text-[#9b2c1f]" : "text-[#5b6b80]")}>{t.fecha_limite.slice(8, 10)}-{t.fecha_limite.slice(5, 7)}</span>}
              </button>
            ))}
          </div>
          <BitacoraDia user={user} />
        </div>
        <div className="w-full md:flex-[0_1_360px] md:min-w-[280px] flex flex-col gap-4">
          <CorreoRecordatorio />
          <TurnosAsesores day={day} />
        </div>
      </div>
    </div>
  );
}