import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Asesor que corresponde según la rotativa anual para la fecha y turno.
export default function useRotativa(fecha, turno) {
  const { data } = useQuery({
    queryKey: ["rotativa", fecha, turno],
    enabled: !!fecha && !!turno,
    queryFn: async () => (await base44.entities.Rotativa.filter({ fecha, turno }, { limit: 1 })).items[0]?.asesor || null,
  });
  return data || null;
}