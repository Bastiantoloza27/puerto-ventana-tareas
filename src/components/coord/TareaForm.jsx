import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { attempt } from "@/lib/safe";
import { inp, btnP } from "@/lib/coord";

// Con `asignables` es Jefatura asignando; sin ellos, el coordinador crea una tarea propia.
export default function TareaForm({ asignables, onClose, onSaved }) {
  const { user } = useAuth();
  const [f, setF] = useState({ titulo: "", descripcion: "", fecha_limite: "", prioridad: "media", email: asignables?.[0]?.email || "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = async () => {
    const quien = asignables ? asignables.find((c) => c.email === f.email) : { email: user.email, nombre: user.full_name };
    setBusy(true);
    const ok = await attempt(() => base44.entities.TareaCoordinador.create({
      titulo: f.titulo.trim(), descripcion: f.descripcion, fecha_limite: f.fecha_limite || null, prioridad: f.prioridad,
      asignado_email: quien.email.toLowerCase(), asignado_nombre: quien.nombre, asignado_por: user.full_name || "Jefatura",
      origen: asignables ? "jefatura" : "propia", estado: "pendiente", avances: [],
    }), asignables ? `Tarea asignada a ${quien.nombre}` : "Tarea creada", "No se pudo guardar la tarea");
    setBusy(false);
    if (ok) { onSaved(); onClose(); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading text-xl font-normal">{asignables ? "Asignar tarea a coordinador" : "Nueva tarea propia"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-3">
          {asignables && <select value={f.email} onChange={set("email")} className={inp}>{asignables.map((c) => <option key={c.email} value={c.email}>{c.nombre}</option>)}</select>}
          <input value={f.titulo} onChange={set("titulo")} placeholder="Título de la tarea" className={inp} autoFocus />
          <textarea value={f.descripcion} onChange={set("descripcion")} rows={3} placeholder="Descripción o instrucciones" className={inp} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-[#5b6b80] flex flex-col gap-1">Fecha límite<input type="date" value={f.fecha_limite} onChange={set("fecha_limite")} className={inp} /></label>
            <label className="text-xs text-[#5b6b80] flex flex-col gap-1">Prioridad<select value={f.prioridad} onChange={set("prioridad")} className={inp}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></label>
          </div>
          <button onClick={save} disabled={busy || !f.titulo.trim() || (asignables && !f.email)} className={btnP}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}{asignables ? "Asignar" : "Crear tarea"}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}