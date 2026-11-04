import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { card } from "@/lib/apr";

const LBL = { jefatura: "Jefatura", asesor: "Asesor", gerencia: "Gerencia" };

// Lista del equipo oficial. Cuando una persona ya ingresó, se le aplica su perfil automáticamente.
export default function EquipoRegistrado({ users, onSynced }) {
  const { data: equipo = [] } = useQuery({ queryKey: ["integrantes"], queryFn: () => base44.entities.Integrante.list("nombre", 100) });
  const byEmail = (e) => users.find((u) => u.email?.toLowerCase() === e.toLowerCase());

  useEffect(() => {
    const pend = equipo.filter((i) => { const u = byEmail(i.email); return u && !u.perfil; });
    if (!pend.length) return;
    Promise.all(pend.map((i) => { const u = byEmail(i.email); return base44.entities.User.update(u.id, { perfil: i.perfil, role: i.perfil === "jefatura" ? "admin" : "user" }); })).then(onSynced);
  }, [equipo, users]);

  return (
    <div className={card + " overflow-hidden"}>
      <div className="px-4 py-3 border-b border-[#eef1f1] text-sm text-[#3c4849]">Equipo registrado · el perfil se asigna solo cuando la persona ingresa por primera vez.</div>
      {equipo.map((i) => (
        <div key={i.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#eef1f1] last:border-0 flex-wrap">
          <span className="flex-1 min-w-[200px]"><span className="text-sm font-medium block">{i.nombre}</span><span className="text-xs text-[#6b7778]">{i.email} · {i.cargo}</span></span>
          <span className="text-xs px-2 py-0.5 rounded-xl bg-[#e2f4f4] text-[#005f60]">{LBL[i.perfil]}</span>
          <span className="text-xs text-[#6b7778] w-[110px] text-right">{byEmail(i.email) ? "Con acceso" : "Sin invitar aún"}</span>
        </div>
      ))}
    </div>
  );
}