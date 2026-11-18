import { useState } from "react";
import { Plus } from "lucide-react";
import useLista from "@/hooks/useLista";
import { card, chipCls } from "@/lib/apr";
import { btnP } from "@/lib/coord";
import TareaCoordCard from "@/components/coord/TareaCoordCard";
import TareaForm from "@/components/coord/TareaForm";

const FILTROS = [["activas", "Pendientes y en curso"], ["completada", "Completadas"], ["todas", "Todas"]];

export default function TareasCoord({ user }) {
  const [filtro, setFiltro] = useState("activas");
  const [nueva, setNueva] = useState(false);
  const est = filtro === "activas" ? { estado: { $ne: "completada" } } : filtro === "todas" ? {} : { estado: filtro };
  const tareas = useLista("TareaCoordinador", { asignado_email: user.email.toLowerCase(), ...est }, { sort: "fecha_limite", limit: 200 });
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex justify-between gap-3 flex-wrap items-center">
        <div className="flex gap-1.5 flex-wrap">{FILTROS.map(([k, l]) => <button key={k} onClick={() => setFiltro(k)} className={chipCls(filtro === k)}>{l}</button>)}</div>
        <button onClick={() => setNueva(true)} className={btnP}><Plus className="w-4 h-4" /> Tarea propia</button>
      </div>
      {tareas.loading ? <div className="py-12 grid place-items-center"><div className="w-6 h-6 border-[3px] border-[#cdd4d4] border-t-[#2a64b8] rounded-full animate-spin" /></div>
        : !tareas.items.length ? <div className={card + " p-5 text-sm text-[#6b7778]"}>No hay tareas en esta vista.</div>
        : tareas.items.map((t) => <TareaCoordCard key={t.id} t={t} onSaved={tareas.refresh} />)}
      {nueva && <TareaForm onClose={() => setNueva(false)} onSaved={tareas.refresh} />}
    </div>
  );
}