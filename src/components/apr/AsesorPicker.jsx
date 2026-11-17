import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ASES, chipCls } from "@/lib/apr";

const tk = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/).filter(Boolean);
// Si el coordinador ya está en la lista de asesores, se usa ese mismo nombre para no separar su historial.
const nombreAses = (n) => ASES.find((a) => tk(a).filter((t) => tk(n).includes(t)).length >= 2);

// Asesores de turno + coordinadores que pueden tomar el turno en un reemplazo.
export default function AsesorPicker({ value, onChange, locked }) {
  const { user } = useAuth();
  const { data: equipo = [] } = useQuery({
    queryKey: ["equipo"],
    queryFn: async () => (await base44.entities.Integrante.filter({}, { sort: "nombre", limit: 100 })).items,
  });
  const coords = equipo.filter((i) => /coordinador/i.test(i.cargo || "")).map((i) => ({ ...i, valor: nombreAses(i.nombre) || i.nombre }));
  const ases = ASES.filter((a) => !coords.some((c) => c.valor === a));
  const extra = value && !ases.includes(value) && !coords.some((c) => c.valor === value) ? [value] : [];
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-1.5 flex-wrap">{[...ases, ...extra].map((a) => <button key={a} disabled={locked} onClick={() => onChange(a)} className={chipCls(value === a)}>{a}</button>)}</div>
      {coords.length > 0 && <>
        <span className="text-xs text-[#6b7778]">Coordinadores · reemplazos en terreno</span>
        <div className="flex gap-1.5 flex-wrap">
          {coords.map((c) => {
            const yo = (c.email || "").toLowerCase() === (user?.email || "").toLowerCase();
            return <button key={c.id} disabled={locked} onClick={() => onChange(c.valor)} className={chipCls(value === c.valor)}>{c.valor}{yo ? " (yo)" : ""}</button>;
          })}
        </div>
      </>}
    </div>
  );
}