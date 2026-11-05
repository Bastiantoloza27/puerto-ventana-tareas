import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card } from "@/lib/apr";
import EquipoForm from "@/components/apr/EquipoForm";

const LBL = { jefatura: "Jefatura", asesor: "Asesor" };

// Equipo oficial. Cuando una persona ya ingresó, se le aplica su perfil automáticamente.
export default function EquipoRegistrado({ users, onSynced }) {
  const qc = useQueryClient();
  const { data: equipo = [] } = useQuery({ queryKey: ["integrantes"], queryFn: () => base44.entities.Integrante.list("nombre", 100) });
  const [adding, setAdding] = useState(false);
  const byEmail = (e) => users.find((u) => u.email?.toLowerCase() === e.toLowerCase());
  const reload = () => qc.invalidateQueries({ queryKey: ["integrantes"] });

  useEffect(() => {
    const pend = equipo.filter((i) => { const u = byEmail(i.email); return u && !u.perfil; });
    if (!pend.length) return;
    Promise.all(pend.map((i) => { const u = byEmail(i.email); return base44.functions.invoke("asignarPerfil", { user_id: u.id, perfil: i.perfil }); })).then(onSynced);
  }, [equipo, users]);

  const add = async (f) => {
    await base44.entities.Integrante.create({ nombre: f.nombre.trim(), email: f.email.trim().toLowerCase(), cargo: f.cargo.trim(), perfil: f.perfil });
    setAdding(false);
    reload();
  };
  const remove = async (i) => {
    if (!confirm(`¿Quitar a ${i.nombre} del equipo?`)) return;
    await base44.entities.Integrante.delete(i.id);
    reload();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="text-sm text-[#3c4849]">Equipo registrado · el perfil se asigna solo cuando la persona ingresa por primera vez.</span>
        {!adding && <button onClick={() => setAdding(true)} className="w-full sm:w-auto min-h-[44px] md:min-h-0 px-4 py-2.5 md:py-2 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" />Agregar integrante</button>}
      </div>
      {adding && <EquipoForm onSave={add} onCancel={() => setAdding(false)} />}
      <div className={card + " overflow-hidden"}>
        {!equipo.length && <div className="px-4 py-3 text-sm text-[#6b7778]">Aún no hay integrantes en el equipo.</div>}
        {equipo.map((i) => (
          <div key={i.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#eef1f1] last:border-0 flex-wrap">
            <span className="flex-1 min-w-[200px]"><span className="text-sm font-medium block">{i.nombre}</span><span className="text-xs text-[#6b7778]">{i.email}{i.cargo ? ` · ${i.cargo}` : ""}</span></span>
            <span className="text-xs px-2 py-0.5 rounded-xl bg-[#e2f4f4] text-[#16386a]">{LBL[i.perfil]}</span>
            <span className="text-xs text-[#6b7778] w-[110px] text-right">{byEmail(i.email) ? "Con acceso" : "Sin invitar aún"}</span>
            <button onClick={() => remove(i)} aria-label={`Quitar a ${i.nombre}`} className="p-2.5 md:p-1.5 rounded hover:bg-[#f6e4e0]"><Trash2 className="w-4 h-4 text-[#9b3b2e]" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}