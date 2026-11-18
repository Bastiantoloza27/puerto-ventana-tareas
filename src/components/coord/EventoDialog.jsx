import { useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { attempt } from "@/lib/safe";
import { inp, tipoCls, toMin, fromMin, SLOTS } from "@/lib/coord";
import TipoSwatches from "@/components/coord/TipoSwatches";
import HorasEvento from "@/components/coord/HorasEvento";

// Crear / editar / borrar un evento. Los eventos de un mismo día no se superponen.
export default function EventoDialog({ fecha, ev, eventos, onClose, onSaved }) {
  const otros = eventos.filter((e) => e.id !== ev?.id && e.hora_inicio).map((e) => [toMin(e.hora_inicio), toMin(e.hora_fin || e.hora_inicio) || toMin(e.hora_inicio) + 30]);
  const libre = (v) => otros.every(([s, e]) => v < s || v >= e);
  const primera = SLOTS.find((v) => v >= 540 && libre(v)) ?? SLOTS.find(libre) ?? 540;
  const [f, setF] = useState({ titulo: ev?.titulo || "", tipo: ev?.tipo || "reunion", fecha: ev?.fecha || fecha, ini: ev?.hora_inicio ? toMin(ev.hora_inicio) : primera, fin: ev?.hora_fin ? toMin(ev.hora_fin) : primera + 60, lugar: ev?.lugar || "", descripcion: ev?.descripcion || "", hecho: ev?.estado === "completado" });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const run = async (fn, ok) => { setBusy(true); const r = await attempt(fn, ok, "No se pudo guardar el evento"); setBusy(false); if (r) { onSaved(); onClose(); } };
  const save = () => f.titulo.trim() && run(async () => {
    const data = { titulo: f.titulo.trim(), tipo: f.tipo, fecha: f.fecha, hora_inicio: fromMin(f.ini), hora_fin: fromMin(f.fin), lugar: f.lugar, descripcion: f.descripcion, estado: f.hecho ? "completado" : "pendiente" };
    return ev ? base44.entities.EventoCoordinador.update(ev.id, data) : base44.entities.EventoCoordinador.create(data);
  }, ev ? "Evento actualizado" : "Evento agregado");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px] p-6 gap-0 rounded-lg">
        <DialogTitle className="text-xs font-semibold uppercase tracking-wider text-[#5b6b80]">{ev ? "Editar evento" : "Nuevo evento"}</DialogTitle>
        <div className="flex items-center gap-3 mt-3">
          <span className={"w-3.5 h-3.5 rounded flex-none " + tipoCls(f.tipo)} />
          <input autoFocus value={f.titulo} onChange={(e) => set("titulo")(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} maxLength={60} placeholder="Agregar título"
            className="flex-1 min-w-0 py-1.5 bg-transparent border-b border-[#cdd4d4] focus:border-[#16386a] focus:shadow-[0_1px_0_0_#16386a] outline-none font-heading text-2xl placeholder:text-[#b9c5d4]" />
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          <label className="text-sm font-semibold text-[#16386a] capitalize">{format(parseISO(f.fecha), "EEEE d 'de' MMMM", { locale: es })}
            <input type="date" value={f.fecha} onChange={(e) => e.target.value && set("fecha")(e.target.value)} className="ml-2 text-xs font-normal text-[#5b6b80] bg-transparent" /></label>
          <HorasEvento ini={f.ini} fin={f.fin} libre={libre} otros={otros} onChange={(ini, fin) => setF((s) => ({ ...s, ini, fin }))} />
        </div>
        <TipoSwatches value={f.tipo} onChange={set("tipo")} />
        <input value={f.lugar} onChange={(e) => set("lugar")(e.target.value)} placeholder="Lugar (opcional)" className={inp + " mt-4"} />
        <textarea value={f.descripcion} onChange={(e) => set("descripcion")(e.target.value)} placeholder="Notas (opcional)" rows={2} className={inp + " mt-2"} />
        {ev && <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={f.hecho} onChange={(e) => set("hecho")(e.target.checked)} className="w-4 h-4 accent-[#2a64b8]" /> Marcar como realizado</label>}
        {confirm ? (
          <div className="mt-6 flex items-center gap-2 min-h-[40px] animate-in fade-in">
            <p className="font-semibold text-sm flex-1">¿Eliminar este evento?</p>
            <button onClick={() => setConfirm(false)} className="px-3 py-2 rounded text-xs font-semibold uppercase hover:bg-[#eef1f1]">Cancelar</button>
            <button disabled={busy} onClick={() => run(() => base44.entities.EventoCoordinador.delete(ev.id), "Evento eliminado")} className="px-3 py-2 rounded text-xs font-semibold uppercase bg-[#9b3b2e] text-white">Eliminar</button>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2 min-h-[40px]">
            {ev && <button onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-[#9b3b2e]"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>}
            <span className="flex-1" />
            <button disabled={busy || !f.titulo.trim()} onClick={save} className="px-5 py-2.5 rounded bg-[#16386a] hover:bg-[#0f2340] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 disabled:opacity-40">{busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Guardar</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}