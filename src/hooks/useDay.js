import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { today } from "@/lib/apr";

export default function useDay() {
  const fecha = today();
  const qc = useQueryClient();
  const catQ = useQuery({ queryKey: ["catalog"], queryFn: async () => (await base44.entities.Actividad.filter({}, { sort: "orden", limit: 100 })).items });
  const planQ = useQuery({ queryKey: ["day", fecha, "plans"], queryFn: async () => (await base44.entities.Programacion.filter({ fecha }, { limit: 10 })).items });
  const ids = (planQ.data || []).map((p) => p.id);
  const execQ = useQuery({ queryKey: ["day", fecha, "execs", ids], enabled: ids.length > 0, queryFn: async () => (await base44.entities.Ejecucion.filter({ programacion_id: { $in: ids } }, { limit: 500 })).items });
  const novQ = useQuery({ queryKey: ["day", fecha, "novs", ids], enabled: ids.length > 0, queryFn: async () => (await base44.entities.Novedad.filter({ programacion_id: { $in: ids } }, { sort: "-hora", limit: 200 })).items });
  const plans = Object.fromEntries((planQ.data || []).map((p) => [p.turno, p]));
  return {
    fecha,
    loading: catQ.isLoading || planQ.isLoading,
    catalog: catQ.data || [],
    plans,
    execs: execQ.data || [],
    novs: novQ.data || [],
    refresh: () => qc.invalidateQueries({ queryKey: ["day", fecha] }),
  };
}