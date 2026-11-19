import { useState } from "react";
import { card, chipCls, SH } from "@/lib/apr";
import { PUESTOS, GRUPOS, tareasPuesto } from "@/lib/vigilantes";
import ManualesVig from "@/components/vig/ManualesVig";
import PlanMesVig from "@/components/vig/PlanMesVig";

// Programación sencilla: las fijas ya están; Jefatura solo suma tareas manuales.
export default function VigProgramacion({ v, fecha, turno }) {
  const [puesto, setPuesto] = useState(PUESTOS[0][0]);
  const items = tareasPuesto(v, fecha, turno, puesto).filter((i) => i.t.grupo !== "manual");
  return (
    <div className="flex flex-wrap gap-5 items-start">
      <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-4">
        <div className={card + " p-4 flex flex-col gap-3"}>
          <span className="font-heading text-xl">Puesto · {SH[turno].name}</span>
          <div className="flex gap-1.5 flex-wrap">{PUESTOS.map(([k, l]) => <button key={k} onClick={() => setPuesto(k)} className={chipCls(puesto === k)}>{l}</button>)}</div>
        </div>
        <div className={card + " p-4 flex flex-col gap-3"}>
          <div className="flex justify-between items-baseline gap-2"><span className="font-heading text-lg">Tareas que ya tiene el turno</span><span className="font-mono text-sm text-[#6b7778]">{items.length}</span></div>
          <span className="text-xs text-[#6b7778]">Fijas de la matriz y mensuales que le tocan hoy. No requieren publicación ni correo.</span>
          {GRUPOS.filter(([g]) => g !== "manual").map(([g, title]) => {
            const lista = items.filter((i) => i.t.grupo === g);
            if (!lista.length) return null;
            return (
              <div key={g} className="flex flex-col gap-1">
                <span className="text-xs font-mono tracking-wider text-[#5b6b80] uppercase">{title}</span>
                {lista.map(({ t }) => <span key={t.id} className="text-sm py-1.5 border-b border-[#eef1f1] last:border-0">{t.tarea}</span>)}
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full md:flex-[0_1_380px] md:min-w-[280px] flex flex-col gap-4 lg:sticky lg:top-6">
        <ManualesVig v={v} fecha={fecha} turno={turno} puesto={puesto} />
        <PlanMesVig v={v} puesto={puesto} fecha={fecha} />
      </div>
    </div>
  );
}