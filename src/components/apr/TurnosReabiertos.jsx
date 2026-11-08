import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SH, shortDate } from "@/lib/apr";

// Aviso de turnos que Jefatura reabrió: lleva al asesor a corregirlos aunque sean de otro día.
export default function TurnosReabiertos({ actual, onOpen }) {
  const navigate = useNavigate();
  const { data = [] } = useQuery({
    queryKey: ["reabiertas"],
    queryFn: async () => (await base44.entities.Programacion.filter({ reabierta: true, estado: "publicada" }, { sort: "-fecha", limit: 5 })).items,
  });
  const lista = data.filter((p) => !(p.fecha === actual.fecha && p.turno === actual.turno));
  if (!lista.length) return null;
  return (
    <div className="rounded-lg border border-[#c9b98a] bg-[#fbf3dc] p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#7a5d0e] font-mono text-[11px] tracking-[.08em]"><RotateCcw className="w-4 h-4" /> TURNO REABIERTO PARA CORRECCIÓN</div>
      {lista.map((p) => (
        <div key={p.id} className="bg-white/70 rounded-md px-3 py-2 flex flex-wrap items-center gap-2">
          <span className="flex-1 min-w-[180px] text-[13px]">{SH[p.turno].name} del <span className="font-mono">{shortDate(p.fecha)}</span> · {p.asesor || "sin asesor"}</span>
          <button onClick={() => { onOpen({ fecha: p.fecha, turno: p.turno }); navigate("/turno"); }} className="min-h-[36px] px-3 py-1.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-xs">Ir a corregir</button>
        </div>
      ))}
    </div>
  );
}