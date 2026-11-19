import { card, SH } from "@/lib/apr";
import { PUESTOS, tareasPuesto, avance } from "@/lib/vigilantes";
import PuestoAvance from "@/components/vig/PuestoAvance";
import KpiRow from "@/components/apr/KpiRow";

export default function VigSeguimiento({ v, fecha, turno }) {
  const total = avance(PUESTOS.flatMap(([p]) => tareasPuesto(v, fecha, turno, p)));
  return (
    <div className="flex flex-col gap-4">
      <span className="font-heading text-xl">Cumplimiento en vivo · {SH[turno].name}</span>
      <KpiRow k={total} />
      <div className="grid md:grid-cols-2 gap-3 items-start">
        {PUESTOS.map(([p]) => <PuestoAvance key={p} v={v} fecha={fecha} turno={turno} puesto={p} />)}
      </div>
    </div>
  );
}