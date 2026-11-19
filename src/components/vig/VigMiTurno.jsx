import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { card, SH } from "@/lib/apr";
import { PUESTOS, GRUPOS, corto, tareasPuesto, avance } from "@/lib/vigilantes";
import KpiRow from "@/components/apr/KpiRow";
import VigTareaCard from "@/components/vig/VigTareaCard";
import Progreso from "@/components/vig/Progreso";

const KEY = "vig_puesto";

export default function VigMiTurno({ v, fecha, turno }) {
  const { user } = useAuth();
  const guardado = localStorage.getItem(KEY);
  const [puesto, setPuestoS] = useState(() => (PUESTOS.some(([k]) => k === guardado) ? guardado : ""));
  const setPuesto = (p) => { localStorage.setItem(KEY, p); setPuestoS(p); };

  if (!puesto) return (
    <div className={card + " p-5 flex flex-col gap-4 max-w-2xl"}>
      <span className="font-heading text-2xl">¿En qué puesto estás hoy?</span>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {PUESTOS.map(([k, l]) => <button key={k} onClick={() => setPuesto(k)} className="min-h-[64px] rounded-lg border-2 border-[#cdd4d4] hover:border-[#2a64b8] text-lg font-medium text-[#16386a] transition-colors">{l}</button>)}
      </div>
    </div>
  );

  const items = tareasPuesto(v, fecha, turno, puesto);
  const a = avance(items);
  const ctx = { fecha, turno, puesto, vigilante: user?.full_name || "" };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-sm text-[#3c4849]">
        <span>Puesto <b className="text-[#1c2526]">{corto(puesto)}</b> · {SH[turno].name} · {SH[turno].hours}</span>
        <span className="text-[13px] text-[#6b7778]">Tareas fijas del puesto: si no se pudo hacer una, hay que indicar por qué.</span>
      </div>
      <KpiRow k={a} />
      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-[22px]">
          {!items.length && <div className={card + " p-5 text-[#5b6b80]"}>No hay tareas para este puesto en este turno.</div>}
          {GRUPOS.map(([g, title, sub]) => {
            const lista = items.filter((i) => i.t.grupo === g);
            if (!lista.length) return null;
            return (
              <div key={g} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-baseline gap-2.5 flex-wrap">
                  <span className="flex items-baseline gap-2"><span className="text-base font-semibold">{title}</span><span className="font-mono text-[13px] text-[#6b7778]">{lista.length}</span></span>
                  <span className="text-[13px] text-[#6b7778]">{sub}</span>
                </div>
                {lista.map((i) => <VigTareaCard key={i.t.id} item={i} ctx={ctx} editable onSaved={v.refresh} />)}
              </div>
            );
          })}
        </div>
        <div className={card + " w-full md:flex-[0_1_340px] md:min-w-[260px] p-4 flex flex-col gap-3 lg:sticky lg:top-6"}>
          <span className="font-heading text-lg">Avance del puesto</span>
          <div className="text-sm"><b className="font-mono">{a.ok + a.no}</b> de <b className="font-mono">{a.total}</b> tareas registradas</div>
          <Progreso a={a} />
          <button onClick={() => setPuesto("")} className="px-4 py-2.5 rounded-md text-sm border border-[#cdd4d4] hover:border-[#2a64b8] text-[#1c2526]">Cambiar puesto</button>
        </div>
      </div>
    </div>
  );
}