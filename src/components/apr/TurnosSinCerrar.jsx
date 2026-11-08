import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SH, ORDER, shortDate, turnoActual } from "@/lib/apr";

// Turnos publicados que ya terminaron y nadie cerró (su reporte no se ha enviado).
export default function TurnosSinCerrar({ onOpen }) {
  const navigate = useNavigate();
  const act = turnoActual();
  const { data = [] } = useQuery({
    queryKey: ["day", "sin-cerrar", act.fecha, act.turno],
    queryFn: async () => (await base44.entities.Programacion.filter({ estado: "publicada", fecha: { $lte: act.fecha } }, { sort: "-fecha", limit: 30 })).items,
  });
  const lista = data.filter((p) => !p.reabierta && (p.fecha < act.fecha || ORDER.indexOf(p.turno) < ORDER.indexOf(act.turno)));
  if (!lista.length) return null;
  return (
    <div className="rounded-lg border border-[#e0b4ab] bg-[#f6e4e0] p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#9b3b2e] font-mono text-[11px] tracking-[.08em]"><AlertTriangle className="w-4 h-4" /> TURNOS SIN CERRAR · REPORTE NO ENVIADO ({lista.length})</div>
      {lista.map((p) => (
        <div key={p.id} className="bg-white/70 rounded-md px-3 py-2 flex flex-wrap items-center gap-2">
          <span className="flex-1 min-w-[180px] text-[13px]">{SH[p.turno].name} del <span className="font-mono">{shortDate(p.fecha)}</span> · {p.asesor || "sin asesor"}</span>
          <button onClick={() => { onOpen({ fecha: p.fecha, turno: p.turno }); navigate("/cierre"); }} className="min-h-[36px] px-3 py-1.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-xs">Ir a cerrar</button>
        </div>
      ))}
    </div>
  );
}