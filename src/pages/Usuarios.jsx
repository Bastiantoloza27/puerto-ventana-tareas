import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { card } from "@/lib/apr";
import usePerfil from "@/hooks/usePerfil";
import { useAuth } from "@/lib/AuthContext";

const PERFILES = [["jefatura", "Jefatura"], ["asesor", "Asesor"], ["gerencia", "Gerencia (solo lectura)"]];

export default function Usuarios() {
  const { isAdmin } = usePerfil();
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], enabled: isAdmin, queryFn: () => base44.entities.User.list() });
  const { user: me } = useAuth();
  const setPerfil = async (u, perfil) => {
    const role = perfil === "jefatura" ? "admin" : u.id === me?.id ? u.role : "user";
    await base44.entities.User.update(u.id, { perfil, role });
    qc.invalidateQueries({ queryKey: ["users"] });
  };

  if (!isAdmin) return <div className={card + " p-6 text-sm text-[#6b7778]"}>Solo Jefatura puede administrar usuarios.</div>;
  return (
    <div className={card + " overflow-hidden"}>
      <div className="px-4 py-3 border-b border-[#eef1f1] text-sm text-[#3c4849]">Asigna el perfil de cada persona. Gerencia ve todo, pero no puede modificar nada.</div>
      {isLoading && <div className="p-4 text-sm text-[#6b7778]">Cargando…</div>}
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#eef1f1] last:border-0 flex-wrap">
          <span className="flex-1 min-w-[180px]"><span className="text-sm font-medium block">{u.full_name || u.email}</span><span className="text-xs text-[#6b7778]">{u.email}{u.role === "admin" ? " · administrador" : ""}</span></span>
          <select value={u.perfil || ""} onChange={(e) => setPerfil(u, e.target.value)} className="min-h-[44px] md:min-h-0 text-sm px-2.5 py-2 md:py-1.5 rounded-md border border-[#cdd4d4] bg-white">
            <option value="" disabled>Sin perfil</option>
            {PERFILES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}