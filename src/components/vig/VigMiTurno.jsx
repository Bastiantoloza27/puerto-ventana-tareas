import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { card, SH } from "@/lib/apr";
import { PUESTOS, GRUPOS, corto, tareasPuesto, avance } from "@/lib/vigilantes";
import TareaVigCard from "@/components/vig/TareaVigCard";
import Progreso from "@/components/vig/Progreso";

const KEY = "vig_puesto";

export default function VigMiTurno({ v, fecha, turno }) {
  const { user } = useAuth();
  const [puesto, setPuestoS] = useState(() => localStorage.getItem(KEY) || "");
  const setPuesto = (p) => { localStorage.setItem(KEY, p); setPuestoS(p); };

  if (!puesto) return (
    <div className={card + " p-5 flex flex-col gap-4"}>
      <span className="font-heading text-2xl">¿En qué puesto estás hoy?</span>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {PUESTOS.map(([k, l]) => <button key={k} onClick={() => setPuesto(k)} className="min-h-[64px] rounded-lg border-2 border-[#cdd4d4] hover:border-[#2a64b8] text-lg font-medium text-[#16386a] transition-colors">{l}</button>)}
      </div>
    </div>
  );

  const items = tareasPuesto(v, turno, puesto);
  const a = avance(items);
  const ctx = { fecha, turno, puesto, vigilante: user?.full_name || "" };
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className={card + " p-5 flex flex-col gap-3"}>
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div>
            <div className="text-sm text-[#5b6b80]">{SH[turno].name} · {SH[turno].hours}</div>
            <div className="font-heading text-2xl">{corto(puesto)}</div>
          </div>
          <button onClick={() => setPuesto("")} className="text-sm text-[#2a64b8] underline min-h-[44px]">Cambiar puesto</button>
        </div>
        <div className="text-lg"><b className="font-mono">{a.ok + a.no}</b> de <b className="font-mono">{a.total}</b> tareas registradas</div>
        <Progreso a={a} big />
      </div>
      {!items.length && <div className={card + " p-5 text-[#5b6b80]"}>No hay tareas para este puesto en este turno.</div>}
      {GRUPOS.map(([g, label]) => {
        const lista = items.filter((i) => i.t.grupo === g);
        if (!lista.length) return null;
        return (
          <section key={g} className="flex flex-col gap-2.5">
            <h2 className="font-heading text-xl mt-2">{label} <span className="text-sm font-body text-[#5b6b80]">· {lista.length}</span></h2>
            {lista.map((i) => <TareaVigCard key={i.t.id} item={i} ctx={ctx} editable onSaved={v.refresh} />)}
          </section>
        );
      })}
    </div>
  );
}