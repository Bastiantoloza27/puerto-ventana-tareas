import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Jefatura anula un turno publicado (ej. asignado a alguien en día libre) para reasignarlo.
export default function AnularTurno({ plan, registros, onAnular }) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const ok = await onAnular(motivo.trim());
    setBusy(false);
    if (ok) { setOpen(false); setMotivo(""); }
  };
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md text-sm text-[#9b3b2e] border border-[#e3c9c3] hover:bg-[#f6e4e0] flex items-center justify-center gap-2">
        <Ban className="w-4 h-4" />Anular turno
      </button>
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular turno publicado</DialogTitle>
            <DialogDescription>
              El turno de {plan.asesor || "—"} vuelve a borrador sin asesor y se cancela el correo agendado. Las actividades seleccionadas se mantienen para que lo reasignes y lo publiques de nuevo.
              {registros > 0 && ` Ya hay ${registros} registro(s) hechos en este turno: se conservan.`}
            </DialogDescription>
          </DialogHeader>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} placeholder="Motivo (obligatorio), ej. asesor en día libre"
            className="w-full text-base md:text-sm px-3 py-2.5 rounded-md border border-[#cdd4d4] focus:outline-none focus:border-[#b9574a]" />
          <DialogFooter className="gap-2">
            <button disabled={busy} onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-md border border-[#cdd4d4] text-sm">Cancelar</button>
            <button disabled={busy || !motivo.trim()} onClick={go} className="px-4 py-2.5 rounded-md bg-[#b9574a] hover:bg-[#9b3b2e] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}Anular turno
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}