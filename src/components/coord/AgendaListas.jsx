import useLista from "@/hooks/useLista";
import { card, today, shortDate } from "@/lib/apr";
import { tipoCls, rango } from "@/lib/coord";

function Lista({ titulo, items, vacio, onOpen }) {
  return (
    <div className={card + " p-4 flex flex-col gap-2.5"}>
      <span className="font-heading text-lg">{titulo}</span>
      {!items.length && <span className="text-sm text-[#6b7778]">{vacio}</span>}
      {items.map((e) => (
        <button key={e.id} onClick={() => onOpen(e)} className="flex items-center gap-3 text-left rounded-md px-2 py-1.5 hover:bg-[#f5f8fc]">
          <span className={"w-2.5 h-2.5 rounded-full flex-none " + tipoCls(e.tipo)} />
          <span className="font-mono text-xs text-[#5b6b80] w-12">{shortDate(e.fecha)}</span>
          <span className={"text-sm flex-1 min-w-0 truncate " + (e.estado === "completado" ? "line-through text-[#6b7778]" : "")}>{e.titulo}</span>
          <span className="text-xs text-[#5b6b80] whitespace-nowrap">{rango(e)}</span>
        </button>
      ))}
    </div>
  );
}

export default function AgendaListas({ user, onOpen }) {
  const prox = useLista("EventoCoordinador", { created_by_id: user.id, fecha: { $gte: today() }, estado: { $ne: "completado" } }, { sort: "fecha", limit: 6 });
  const hechas = useLista("EventoCoordinador", { created_by_id: user.id, estado: "completado" }, { sort: "-fecha", limit: 6 });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Lista titulo="Próximas actividades" items={prox.items} vacio="No hay actividades próximas." onOpen={onOpen} />
      <Lista titulo="Completadas recientemente" items={hechas.items} vacio="Aún no marcas actividades como realizadas." onOpen={onOpen} />
    </div>
  );
}