import { useState } from "react";
import { card } from "@/lib/apr";
import FaenaCard from "@/components/apr/FaenaCard";

// Faenas del turno según la nombrada: primero las con nave, luego por dotación.
export default function FaenasPanel({ plan, catalog }) {
  const [todas, setTodas] = useState(false);
  const faenas = [...(plan?.faenas || [])].sort((a, b) => (!!b.nave - !!a.nave) || b.dotacion - a.dotacion);
  if (!faenas.length) return null;
  const visibles = todas ? faenas : faenas.slice(0, 6);
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="flex justify-between items-baseline gap-2 flex-wrap">
        <span className="font-heading text-xl">Faenas de la nombrada</span>
        <span className="text-xs text-[#6b7778]">{faenas.length} faenas · <b className="font-mono text-[#16386a]">{plan.dotacion ?? faenas.reduce((s, f) => s + f.dotacion, 0)}</b> personas en turno</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">{visibles.map((f, i) => <FaenaCard key={f.faena + i} f={f} catalog={catalog} />)}</div>
      {faenas.length > 6 && <button onClick={() => setTodas(!todas)} className="text-sm text-[#2a64b8] hover:underline self-start">{todas ? "Ver menos" : `Ver las ${faenas.length} faenas`}</button>}
    </div>
  );
}