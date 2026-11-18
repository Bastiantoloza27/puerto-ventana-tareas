import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card, shortDate } from "@/lib/apr";
import { attempt } from "@/lib/safe";
import EvidenceList from "@/components/apr/EvidenceList";

export default function ActaCard({ a, onEdit, onSaved }) {
  const [open, setOpen] = useState(false);
  const del = () => confirm(`¿Eliminar el acta "${a.titulo}"?`) && attempt(async () => { await base44.entities.ActaReunion.delete(a.id); onSaved(); }, "Acta eliminada", "No se pudo eliminar");
  return (
    <div className={card + " p-4 flex flex-col gap-2"}>
      <div className="flex gap-3 items-start">
        <div className="w-12 flex-none text-center rounded-md bg-[#eef3fa] py-1.5"><div className="font-mono text-sm text-[#16386a]">{shortDate(a.fecha)}</div><div className="text-[10px] text-[#5b6b80]">{a.hora}</div></div>
        <button onClick={() => setOpen(!open)} className="flex-1 text-left min-w-0">
          <div className="font-medium">{a.titulo}</div>
          <div className="text-xs text-[#5b6b80] truncate">{[a.lugar, a.participantes].filter(Boolean).join(" · ") || "Sin participantes registrados"}</div>
        </button>
        <button onClick={() => onEdit(a)} aria-label="Editar acta"><Pencil className="w-4 h-4 text-[#2a64b8]" /></button>
        <button onClick={del} aria-label="Eliminar acta"><Trash2 className="w-4 h-4 text-[#9b3b2e]" /></button>
        <button onClick={() => setOpen(!open)} aria-label="Ver acta"><ChevronDown className={"w-4 h-4 transition-transform " + (open ? "rotate-180" : "")} /></button>
      </div>
      {open && (
        <div className="flex flex-col gap-3 pt-2 border-t border-[#eef1f1] animate-in fade-in slide-in-from-top-1">
          {a.desarrollo && <div><div className="text-xs font-semibold uppercase tracking-wider text-[#5b6b80] mb-1">Desarrollo</div><p className="text-sm whitespace-pre-wrap">{a.desarrollo}</p></div>}
          {a.acuerdos && <div><div className="text-xs font-semibold uppercase tracking-wider text-[#5b6b80] mb-1">Acuerdos</div><p className="text-sm whitespace-pre-wrap">{a.acuerdos}</p></div>}
          {a.adjuntos?.length > 0 && <EvidenceList items={a.adjuntos} />}
        </div>
      )}
    </div>
  );
}