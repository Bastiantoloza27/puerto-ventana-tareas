import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { attempt } from "@/lib/safe";
import { now, today } from "@/lib/apr";
import { inp, btnP } from "@/lib/coord";
import EvidenceList from "@/components/apr/EvidenceList";

export default function ActaForm({ acta, onClose, onSaved }) {
  const [f, setF] = useState({ titulo: "", fecha: today(), hora: now(), lugar: "", participantes: "", desarrollo: "", acuerdos: "", adjuntos: [], ...acta });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = async () => {
    const data = { titulo: f.titulo.trim(), fecha: f.fecha, hora: f.hora, lugar: f.lugar, participantes: f.participantes, desarrollo: f.desarrollo, acuerdos: f.acuerdos, adjuntos: f.adjuntos || [] };
    setBusy(true);
    const ok = await attempt(() => (acta ? base44.entities.ActaReunion.update(acta.id, data) : base44.entities.ActaReunion.create(data)), "Acta guardada", "No se pudo guardar el acta");
    setBusy(false);
    if (ok) { onSaved(); onClose(); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-heading text-xl font-normal">{acta ? "Editar acta" : "Nueva acta de reunión"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-3">
          <input value={f.titulo} onChange={set("titulo")} placeholder="Tema o nombre de la reunión" className={inp} autoFocus />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input type="date" value={f.fecha} onChange={set("fecha")} className={inp} />
            <input type="time" value={f.hora} onChange={set("hora")} className={inp} />
            <input value={f.lugar} onChange={set("lugar")} placeholder="Lugar" className={inp + " col-span-2 sm:col-span-1"} />
          </div>
          <input value={f.participantes} onChange={set("participantes")} placeholder="Participantes (separados por coma)" className={inp} />
          <textarea value={f.desarrollo} onChange={set("desarrollo")} rows={6} placeholder="Temas tratados y desarrollo de la reunión" className={inp} />
          <textarea value={f.acuerdos} onChange={set("acuerdos")} rows={4} placeholder="Acuerdos, compromisos y responsables" className={inp} />
          <EvidenceList items={f.adjuntos || []} editable onAdd={(files) => setF((s) => ({ ...s, adjuntos: [...(s.adjuntos || []), ...files] }))} onRemove={(i) => setF((s) => ({ ...s, adjuntos: s.adjuntos.filter((_, j) => j !== i) }))} />
          <button onClick={save} disabled={busy || !f.titulo.trim()} className={btnP}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Guardar acta</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}