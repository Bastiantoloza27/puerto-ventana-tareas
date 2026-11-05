import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card } from "@/lib/apr";
import { attempt } from "@/lib/safe";

const hhmm = (iso) => (iso ? new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "");

export default function OpsMailInbox({ onApply, locked }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState("");
  const { data: pendientes = [] } = useQuery({
    queryKey: ["ops-mail"],
    queryFn: async () => (await base44.entities.CorreoOperacion.filter({ estado: "pendiente" }, { sort: "-created_date", limit: 10 })).items,
  });
  if (!pendientes.length) return null;
  const refresh = () => qc.invalidateQueries({ queryKey: ["ops-mail"] });

  const aplicar = async (c) => {
    setBusy(c.id);
    if ((await onApply(c)) !== false) await attempt(() => base44.entities.CorreoOperacion.update(c.id, { estado: "aplicado" }));
    refresh();
    setBusy("");
  };
  const descartar = async (c) => {
    setBusy(c.id);
    await attempt(() => base44.entities.CorreoOperacion.update(c.id, { estado: "descartado" }));
    refresh();
    setBusy("");
  };

  return (
    <div className="rounded-lg border border-[#c9b98a] bg-[#fbf3dc] p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#7a5d0e] font-mono text-[11px] tracking-[.08em]">
        <Inbox className="w-4 h-4" /> NOMBRADA RECIBIDA · SIN ASIGNAR
      </div>
      {pendientes.map((c) => (
        <div key={c.id} className="bg-white/70 rounded-md px-3 py-2 flex flex-wrap items-center gap-2">
          <span className="flex-1 min-w-[180px]">
            <span className="text-[13px] text-[#1c2526] block truncate">{c.asunto}</span>
            <span className="text-xs text-[#6b7778]">{hhmm(c.recibido)} · {c.lineas?.length || 0} labores{c.asesor ? ` · ${c.asesor}` : ""}</span>
          </span>
          {!locked && (
            <button onClick={() => aplicar(c)} disabled={!!busy} className="min-h-[36px] px-3 py-1.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-xs flex items-center gap-1.5 disabled:opacity-50">
              {busy === c.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Cargar en este turno
            </button>
          )}
          <button onClick={() => descartar(c)} disabled={!!busy} aria-label="Descartar correo" className="p-1.5 rounded hover:bg-[#f6e4e0]"><X className="w-4 h-4 text-[#9b3b2e]" /></button>
        </div>
      ))}
    </div>
  );
}