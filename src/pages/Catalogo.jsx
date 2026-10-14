import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card, TIPO_LABEL } from "@/lib/apr";
import ActividadForm from "@/components/apr/ActividadForm";

export default function Catalogo() {
  const { day } = useOutletContext();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(null); // null | "new" | actividad
  const areas = [...new Set(day.catalog.map((c) => c.area))];
  const reload = () => qc.invalidateQueries({ queryKey: ["catalog"] });

  const save = async (f) => {
    const data = { area: f.area.trim(), sitio: f.sitio.trim(), proceso: f.proceso.trim(), tipo: f.tipo, descripcion: f.descripcion || "", base: !!f.base };
    if (edit === "new") await base44.entities.Actividad.create({ ...data, orden: Math.max(0, ...day.catalog.map((c) => c.orden || 0)) + 1 });
    else await base44.entities.Actividad.update(edit.id, data);
    setEdit(null); reload();
  };
  const toggleBase = async (a) => { await base44.entities.Actividad.update(a.id, { base: !a.base }); reload(); };
  const remove = async (a) => { if (!confirm(`¿Eliminar "${a.proceso}" del catálogo?`)) return; await base44.entities.Actividad.delete(a.id); reload(); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="text-sm text-[#3c4849]">Las marcadas como <b>todos los días</b> se sugieren solas al programar cualquier turno.</span>
        {!edit && <button onClick={() => setEdit("new")} className="w-full sm:w-auto min-h-[44px] md:min-h-0 px-4 py-2.5 md:py-2 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" />Nueva actividad</button>}
      </div>
      {edit && <ActividadForm key={edit.id || "new"} initial={edit === "new" ? null : edit} areas={areas} onSave={save} onCancel={() => setEdit(null)} />}
      {areas.map((area) => (
        <div key={area} className={card + " overflow-hidden"}>
          <div className="px-4 py-3 border-b border-[#eef1f1] text-[15px] font-semibold">{area}</div>
          {day.catalog.filter((c) => c.area === area).map((a) => (
            <div key={a.id} className="flex items-center gap-2 md:gap-3 px-4 py-3 md:py-2.5 border-b border-[#eef1f1] last:border-0 flex-wrap">
              <span className="flex-1 min-w-[180px]"><span className="text-sm font-medium">{a.proceso}</span><span className="text-xs text-[#6b7778]"> · {a.sitio} · {TIPO_LABEL[a.tipo]}</span></span>
              <span className="flex items-center gap-1 md:gap-1.5 ml-auto">
                <button onClick={() => toggleBase(a)} className={"flex items-center min-h-[44px] md:min-h-0 text-xs px-2.5 py-2 md:py-1 rounded-xl border transition-colors " + (a.base ? "bg-[#e2f4f4] border-[#007f80] text-[#005f60]" : "bg-white border-[#cdd4d4] text-[#6b7778]")}>{a.base ? "Todos los días" : "Según necesidad"}</button>
                <button onClick={() => setEdit(a)} aria-label={"Editar " + a.proceso} className="p-2.5 md:p-1.5 rounded hover:bg-[#e2f4f4]"><Pencil className="w-4 h-4 text-[#007f80]" /></button>
                <button onClick={() => remove(a)} aria-label={"Eliminar " + a.proceso} className="p-2.5 md:p-1.5 rounded hover:bg-[#f6e4e0]"><Trash2 className="w-4 h-4 text-[#9b3b2e]" /></button>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}