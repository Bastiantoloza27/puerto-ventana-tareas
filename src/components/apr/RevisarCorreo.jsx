import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card } from "@/lib/apr";
import { attempt } from "@/lib/safe";

const fmt = (f) => (f ? f.split("-").reverse().join("-") : "");

// Busca de inmediato en el buzón de Operaciones correos que aún no se hayan cargado.
export default function RevisarCorreo({ onDone }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const revisar = async () => {
    setBusy(true); setMsg("");
    await attempt(async () => {
      const { data } = await base44.functions.invoke("ingestOpsMail", { revisar: true });
      const nuevos = (data.procesados || []).filter((p) => p.estado !== "duplicado" && p.estado !== "ignorado");
      if (!nuevos.length) return setMsg("No hay correos nuevos en el buzón.");
      setMsg(nuevos.map((p) => p.estado === "nombrada_pdf"
        ? `Nombrada del ${fmt(p.fecha)} cargada en ${(p.turnos || []).filter((t) => t.estado === "aplicado").map((t) => t.turno).join(", ") || "ningún turno"}`
        : p.estado === "aplicado" ? "Correo cargado en el turno" : "Correo recibido, falta asignarle turno").join(" · "));
      onDone?.();
    }, null, "No se pudo revisar el correo");
    setBusy(false);
  };

  return (
    <div className={card + " p-4 flex flex-col gap-2"}>
      <button onClick={revisar} disabled={busy} className="min-h-[44px] md:min-h-0 px-4 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] hover:border-[#2a64b8] text-sm flex items-center justify-center gap-2 disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-[#2a64b8]" />}Revisar correo ahora
      </button>
      <span className="text-[11px] text-[#6b7778]">Úsalo si la nombrada enviada a pvsa.tareas@outlook.com aún no aparece.</span>
      {msg && <span className="text-xs text-[#16386a] bg-[#e2f4f4] rounded-md px-3 py-2">{msg}</span>}
    </div>
  );
}