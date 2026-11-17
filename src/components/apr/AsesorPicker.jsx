import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ASES, chipCls } from "@/lib/apr";

// Asesores de turno + jefaturas y coordinadores que pueden tomar el turno en un reemplazo.
export default function AsesorPicker({ value, onChange, locked }) {
  const { user } = useAuth();
  const { data: jefes = [] } = useQuery({
    queryKey: ["equipo-jefatura"],
    queryFn: async () => (await base44.entities.Integrante.filter({ perfil: "jefatura" }, { sort: "nombre", limit: 50 })).items,
  });
  const extra = value && !ASES.includes(value) && !jefes.some((j) => j.nombre === value) ? [value] : [];
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-1.5 flex-wrap">{[...ASES, ...extra].map((a) => <button key={a} disabled={locked} onClick={() => onChange(a)} className={chipCls(value === a)}>{a}</button>)}</div>
      {jefes.length > 0 && <>
        <span className="text-xs text-[#6b7778]">Jefatura y coordinación · reemplazos en terreno</span>
        <div className="flex gap-1.5 flex-wrap">
          {jefes.map((j) => {
            const yo = (j.email || "").toLowerCase() === (user?.email || "").toLowerCase();
            return <button key={j.id} disabled={locked} onClick={() => onChange(j.nombre)} className={chipCls(value === j.nombre)}>{j.nombre}{yo ? " (yo)" : ""}</button>;
          })}
        </div>
      </>}
    </div>
  );
}