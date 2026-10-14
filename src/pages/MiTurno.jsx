import { Link, useOutletContext } from "react-router-dom";
import KpiRow from "@/components/apr/KpiRow";
import ActivityCard from "@/components/apr/ActivityCard";
import TurnoSide from "@/components/apr/TurnoSide";
import NotPublished from "@/components/apr/NotPublished";
import { now } from "@/lib/apr";
import { saveExec, addLog } from "@/lib/aprActions";

const GROUPS = [["t", "Transversales", "Se esperan en todos los turnos"], ["o", "Según la operación del día", "Programadas desde el correo de Operaciones"], ["c", "Según ocurrencia", "«No ocurrió» no afecta el cumplimiento"]];

export default function MiTurno() {
  const { day, shift, plan, k } = useOutletContext();
  if (!plan || plan.estado === "borrador") return <NotPublished shift={shift} />;
  const closed = plan.estado === "cerrada";
  const E = Object.fromEntries(day.execs.filter((e) => e.programacion_id === plan.id).map((e) => [e.actividad_id, e]));
  const items = (plan.actividad_ids || []).map((id) => day.catalog.find((c) => c.id === id)).filter(Boolean);

  const onSet = (a) => async (patch, log) => {
    await saveExec(plan, a.id, E[a.id], patch.estado ? { ...patch, hora: now() } : patch);
    if (log) await addLog(plan, log);
    day.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-sm leading-normal text-[#3c4849]">
        <span>Asesor de turno <b className="text-[#1c2526]">{plan.asesor}</b> · programación publicada a las {plan.publicada_hora}</span>
        <span className="text-[13px] text-[#6b7778]">Actividades sugeridas: no ejecutar una no es una falta, pero hay que indicar por qué.</span>
      </div>
      <KpiRow k={k} />
      {closed && (
        <div className="bg-[#0e2a2b] text-[#e6efee] rounded-[10px] px-[18px] py-3.5 text-sm flex justify-between gap-2.5 flex-wrap">
          <span>✓ Turno cerrado a las {plan.cerrada_hora} · reporte enviado por correo</span>
          <Link to="/cierre" className="text-[#7fd6d6]">Ver reporte →</Link>
        </div>
      )}
      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-[22px]">
          {GROUPS.map(([tp, title, sub]) => {
            const it = items.filter((a) => a.tipo === tp);
            if (!it.length) return null;
            return (
              <div key={tp} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-baseline gap-2.5 flex-wrap">
                  <span className="flex items-baseline gap-2"><span className="text-base font-semibold">{title}</span><span className="font-mono text-[13px] text-[#6b7778]">{it.length}</span></span>
                  <span className="text-[13px] text-[#6b7778]">{sub}</span>
                </div>
                {it.map((a) => <ActivityCard key={a.id} a={a} e={E[a.id]} editable={!closed} onSet={onSet(a)} />)}
              </div>
            );
          })}
        </div>
        <TurnoSide plan={plan} k={k} fecha={day.fecha} />
      </div>
    </>
  );
}