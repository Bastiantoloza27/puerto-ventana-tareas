import { Link, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import KpiRow from "@/components/apr/KpiRow";
import ActivityCard from "@/components/apr/ActivityCard";
import TurnoSide from "@/components/apr/TurnoSide";
import NotPublished from "@/components/apr/NotPublished";
import FaenasPanel from "@/components/apr/FaenasPanel";
import ExtraForm from "@/components/apr/ExtraForm";
import { now, actsDelPlan } from "@/lib/apr";
import { dotacionDe } from "@/lib/faenaMatch";
import { saveExec, addExtraExec, addLog, bumpMin } from "@/lib/aprActions";
import { attempt } from "@/lib/safe";

const GROUPS = [["t", "Transversales", "Se esperan en todos los turnos"], ["o", "Según la operación del día", "Programadas desde el correo de Operaciones"], ["c", "Según ocurrencia", "«No ocurrió» no afecta el cumplimiento"], ["x", "Extraordinarias", "Solicitadas por Jefatura durante el turno"]];

// Lleva a la primera actividad del turno asociada a la faena y la destaca un momento.
function irA(acts) {
  const el = acts.map((a) => document.getElementById("act-" + a.id)).find(Boolean);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("ring-2", "ring-[#2a64b8]");
  setTimeout(() => el.classList.remove("ring-2", "ring-[#2a64b8]"), 1800);
}

export default function MiTurno() {
  const { day, shift, plan, k, readOnly } = useOutletContext();
  const qc = useQueryClient();
  if (!plan || plan.estado === "borrador") return <NotPublished shift={shift} />;
  const closed = plan.estado === "cerrada";
  const editable = !closed && !readOnly;
  const E = Object.fromEntries(day.execs.filter((e) => e.programacion_id === plan.id).map((e) => [e.actividad_id, e]));
  const items = actsDelPlan(plan, day.catalog, day.execs);
  const dotOf = (a) => (a.extra ? null : dotacionDe(plan, day.catalog, a.id));

  const onSet = (a) => (patch, log) => attempt(async () => {
    const prev = E[a.id]?.controles || [];
    if (patch.estado && patch.estado !== "ok" && prev.length) { patch = { ...patch, controles: [] }; await bumpMin(plan, prev, -1); }
    if (patch.controles && !patch.estado) {
      await bumpMin(plan, patch.controles.filter((f) => !prev.includes(f)), 1);
      await bumpMin(plan, prev.filter((f) => !patch.controles.includes(f)), -1);
    }
    const dot = dotOf(a);
    if (patch.estado && dot != null) patch = { ...patch, personas: dot };
    await saveExec(plan, a.id, E[a.id], patch.estado ? { ...patch, hora: now() } : patch);
    if (patch.controles) qc.invalidateQueries({ queryKey: ["mins"] });
    if (log) await addLog(plan, log);
    day.refresh();
  });

  const addExtra = (f) => attempt(async () => {
    await addExtraExec(plan, f);
    await addLog(plan, `Actividad extraordinaria agregada: ${f.proceso} · ${f.sitio}`);
    day.refresh();
  }, "Actividad extraordinaria agregada");

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-sm leading-normal text-[#3c4849]">
        <span>Asesor de turno <b className="text-[#1c2526]">{plan.asesor}</b> · programación publicada a las {plan.publicada_hora}</span>
        <span className="text-[13px] text-[#6b7778]">Actividades sugeridas: no ejecutar una no es una falta, pero hay que indicar por qué.</span>
      </div>
      <KpiRow k={k} />
      {closed && (
        <div className="bg-[#0f2340] text-[#e6efee] rounded-[10px] px-[18px] py-3.5 text-sm flex justify-between gap-2.5 flex-wrap">
          <span>✓ Turno cerrado a las {plan.cerrada_hora} · reporte enviado por correo</span>
          <Link to="/cierre" className="text-[#9cc0f0]">Ver reporte →</Link>
        </div>
      )}
      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-[22px]">
          <FaenasPanel plan={plan} catalog={day.catalog} onGo={irA} />
          {GROUPS.map(([tp, title, sub]) => {
            const it = items.filter((a) => a.tipo === tp);
            if (!it.length) return null;
            return (
              <div key={tp} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-baseline gap-2.5 flex-wrap">
                  <span className="flex items-baseline gap-2"><span className="text-base font-semibold">{title}</span><span className="font-mono text-[13px] text-[#6b7778]">{it.length}</span></span>
                  <span className="text-[13px] text-[#6b7778]">{sub}</span>
                </div>
                {it.map((a) => <ActivityCard key={a.id} a={a} e={E[a.id]} dot={dotOf(a)} editable={editable} onSet={onSet(a)} />)}
              </div>
            );
          })}
          {editable && <ExtraForm onAdd={addExtra} />}
        </div>
        <TurnoSide plan={plan} k={k} fecha={day.fecha} readOnly={readOnly} />
      </div>
    </>
  );
}