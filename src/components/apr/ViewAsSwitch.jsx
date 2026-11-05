import { Eye } from "lucide-react";
import usePerfil, { VIEW_KEY } from "@/hooks/usePerfil";

export const setViewAs = (v) => { localStorage.setItem(VIEW_KEY, v); window.location.reload(); };

// Aviso cuando la Jefatura está viendo como asesor; en móvil también ofrece el acceso a la vista.
export default function ViewAsSwitch() {
  const { realAdmin, perfil } = usePerfil();
  if (!realAdmin) return null;
  if (perfil === "jefatura") {
    return (
      <button onClick={() => setViewAs("asesor")} className="md:hidden self-start inline-flex items-center gap-1.5 text-xs text-[#2a64b8] font-medium">
        <Eye className="w-3.5 h-3.5" /> Vista de asesor
      </button>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap rounded-md bg-[#fbf3dc] border border-[#e3c77a] text-[#5c4710] text-sm px-3.5 py-2.5">
      <span className="inline-flex items-center gap-2"><Eye className="w-4 h-4" /> Estás viendo como asesor</span>
      <button onClick={() => setViewAs("jefatura")} className="min-h-[36px] px-3 py-1.5 rounded-md bg-[#16386a] text-white text-xs font-medium">Volver a Jefatura</button>
    </div>
  );
}