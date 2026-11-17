import { card, SH } from "@/lib/apr";
import { PUESTOS, tareasPuesto, avance } from "@/lib/vigilantes";
import PuestoAvance from "@/components/vig/PuestoAvance";
import Progreso from "@/components/vig/Progreso";

export default function VigSeguimiento({ v, fecha, turno }) {
  const total = avance(PUESTOS.flatMap(([p]) => tareasPuesto(v, turno, p)));
  return (
    <div className="flex flex-col gap-4">
      <div className={card + " p-5 flex flex-col gap-3"}>
        <div className="flex justify-between items-baseline flex-wrap gap-2">
          <span className="font-heading text-xl">Cumplimiento en vivo · {SH[turno].name}</span>
          <span className="font-mono text-2xl text-[#16386a]">{total.pct}%</span>
        </div>
        <Progreso a={total} big />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
        {PUESTOS.map(([p]) => <PuestoAvance key={p} v={v} fecha={fecha} turno={turno} puesto={p} />)}
      </div>
    </div>
  );
}