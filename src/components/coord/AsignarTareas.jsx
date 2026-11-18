import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import useLista from "@/hooks/useLista";
import { card, today } from "@/lib/apr";
import { btnP } from "@/lib/coord";
import TareaCoordCard from "@/components/coord/TareaCoordCard";
import TareaForm from "@/components/coord/TareaForm";

// Jefatura: asigna tareas y sigue el avance de cada coordinador.
export default function AsignarTareas() {
  const [nueva, setNueva] = useState(false);
  const { data: equipo = [] } = useQuery({ queryKey: ["equipo"], queryFn: async () => (await base44.entities.Integrante.filter({}, { sort: "nombre", limit: 100 })).items });
  const coords = equipo.filter((i) => /coordinador/i.test(i.cargo || "")).map((i) => ({ email: i.email.toLowerCase(), nombre: i.nombre }));
  const tareas = useLista("TareaCoordinador", {}, { sort: "fecha_limite", limit: 500 });
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <span className="text-sm text-[#5b6b80]">Asigna tareas específicas y revisa sus avances. Los coordinadores las ven en su espacio.</span>
        <button onClick={() => setNueva(true)} disabled={!coords.length} className={btnP}><Plus className="w-4 h-4" /> Asignar tarea</button>
      </div>
      {coords.map((c) => {
        const mias = tareas.items.filter((t) => t.asignado_email === c.email);
        const n = (e) => mias.filter((t) => t.estado === e).length;
        const venc = mias.filter((t) => t.estado !== "completada" && t.fecha_limite && t.fecha_limite < today()).length;
        return (
          <section key={c.email} className="flex flex-col gap-2.5">
            <div className={card + " px-4 py-3 flex justify-between items-center flex-wrap gap-2"}>
              <span className="font-heading text-lg">{c.nombre}</span>
              <span className="text-xs text-[#5b6b80] flex gap-3"><span><b className="font-mono">{n("pendiente")}</b> pendientes</span><span><b className="font-mono">{n("en_curso")}</b> en curso</span><span><b className="font-mono text-[#1f6b40]">{n("completada")}</b> completadas</span>{venc > 0 && <span className="text-[#9b2c1f]"><b className="font-mono">{venc}</b> vencidas</span>}</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-2.5 items-start">{mias.filter((t) => t.estado !== "completada").map((t) => <TareaCoordCard key={t.id} t={t} jefe onSaved={tareas.refresh} />)}</div>
          </section>
        );
      })}
      {nueva && <TareaForm asignables={coords} onClose={() => setNueva(false)} onSaved={tareas.refresh} />}
    </div>
  );
}