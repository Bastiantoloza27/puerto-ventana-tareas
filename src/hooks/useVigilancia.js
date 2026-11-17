import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Matriz, ajustes de Jefatura y registros del turno (en vivo).
export default function useVigilancia(fecha, turno) {
  const qc = useQueryClient();
  const mesIni = fecha.slice(0, 8) + "01";
  const matriz = useQuery({ queryKey: ["vig-matriz"], queryFn: async () => (await base44.entities.TareaVigilante.filter({}, { sort: "orden", limit: 300 })).items });
  const ajustes = useQuery({ queryKey: ["vig-ajustes", fecha, turno], queryFn: async () => (await base44.entities.TurnoVigilante.filter({ fecha, turno }, { limit: 20 })).items });
  const regs = useQuery({ queryKey: ["vig-regs", fecha, turno], queryFn: async () => (await base44.entities.RegistroVigilante.filter({ fecha, turno }, { limit: 500 })).items });
  const mes = useQuery({ queryKey: ["vig-mes", mesIni], queryFn: async () => (await base44.entities.RegistroVigilante.filter({ mensual: true, estado: "ok", fecha: { $gte: mesIni } }, { limit: 500 })).items });

  const refresh = () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("vig-") });
  useEffect(() => base44.entities.RegistroVigilante.subscribe(() => refresh()), []);

  return {
    matriz: matriz.data || [], ajustes: ajustes.data || [], regs: regs.data || [], mes: mes.data || [],
    loading: matriz.isLoading || ajustes.isLoading || regs.isLoading, refresh,
  };
}