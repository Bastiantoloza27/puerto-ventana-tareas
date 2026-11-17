import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { SH } from "@/lib/apr";
import { GRUPOS, corto } from "@/lib/vigilantes";
import { attempt } from "@/lib/safe";

// Jefatura ajusta qué tareas de la matriz aplican a un puesto en este turno.
export default function AjustarTareas({ v, fecha, turno, puesto, actuales, onClose }) {
  const [ids, setIds] = useState(actuales.map((i) => i.t.id));
  const [busy, setBusy] = useState(false);
  const aj = v.ajustes.find((a) => a.puesto === puesto);
  const tareas = v.matriz.filter((t) => t.puesto === puesto);
  const toggle = (id) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const run = async (fn, ok) => { setBusy(true); const r = await attempt(fn, ok, "No se pudo guardar el ajuste"); setBusy(false); if (r) { v.refresh(); onClose(); } };
  const guardar = () => run(async () => {
    const orden = tareas.map((t) => t.id).filter((id) => ids.includes(id));
    if (aj) await base44.entities.TurnoVigilante.update(aj.id, { tarea_ids: orden });
    else await base44.entities.TurnoVigilante.create({ fecha, turno, puesto, tarea_ids: orden });
    return true;
  }, "Tareas del turno ajustadas");
  const restaurar = () => run(async () => { await base44.entities.TurnoVigilante.delete(aj.id); return true; }, "Se volvió a la matriz");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader><DialogTitle className="font-heading text-xl font-normal">{corto(puesto)} · {SH[turno].name}</DialogTitle></DialogHeader>
        <div className="overflow-auto flex flex-col gap-3 -mx-1 px-1">
          {GRUPOS.map(([g, label]) => {
            const lista = tareas.filter((t) => t.grupo === g);
            if (!lista.length) return null;
            return (
              <div key={g} className="flex flex-col gap-1">
                <span className="text-xs font-mono tracking-wider text-[#5b6b80] uppercase">{label}</span>
                {lista.map((t) => (
                  <label key={t.id} className="flex gap-2.5 items-start py-1.5 text-sm cursor-pointer">
                    <Checkbox checked={ids.includes(t.id)} onCheckedChange={() => toggle(t.id)} className="mt-0.5" />
                    <span>{t.tarea}{!(t.turnos || []).includes(turno) && <span className="text-[#7a5d0e]"> · normalmente otro turno</span>}</span>
                  </label>
                ))}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 justify-end flex-wrap pt-2 border-t">
          {aj && <button disabled={busy} onClick={restaurar} className="px-3 py-2 rounded-md text-sm border border-[#cdd4d4]">Volver a la matriz</button>}
          <button disabled={busy} onClick={guardar} className="px-4 py-2 rounded-md text-sm bg-[#2a64b8] text-white flex items-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Guardar {ids.length} tareas</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}