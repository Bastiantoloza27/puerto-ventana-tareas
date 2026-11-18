import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Lista de una entidad del espacio de Coordinación; refresh recarga todas sus consultas.
export default function useLista(entity, query = {}, { sort = "-created_date", limit = 200, enabled = true } = {}) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["coord", entity, JSON.stringify(query), sort, limit],
    enabled,
    queryFn: async () => (await base44.entities[entity].filter(query, { sort, limit })).items,
  });
  return { items: q.data || [], loading: q.isLoading, refresh: () => qc.invalidateQueries({ queryKey: ["coord", entity] }) };
}