import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card, SH } from "@/lib/apr";

export default function SubirNombrada({ onDone }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const subir = async (file) => {
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { data } = await base44.functions.invoke("cargarNombrada", { file_uri });
      const [y, m, d] = data.fecha.split("-");
      const det = data.turnos.map((t) => t.estado === "cerrado" ? `${SH[t.turno].name}: ya cerrado, no se modificó` : `${SH[t.turno].name}: ${t.faenas} faenas, ${t.dotacion} personas, ${t.sugeridas} actividades sugeridas`);
      setMsg({ ok: true, text: `Nombrada del ${d}-${m}-${y} cargada. ${det.join(" · ")}` });
      onDone?.(data.fecha);
    } catch (e) {
      setMsg({ ok: false, text: e?.response?.data?.error || "No se pudo leer la nombrada." });
    }
    setBusy(false);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div className={card + " p-4 flex flex-col gap-2.5"}>
      <span className="font-heading text-lg">Nombrada de Operaciones</span>
      <span className="text-xs text-[#6b7778]">Llega sola desde el correo de Operaciones. Si llegó por otra vía o hubo cambios por WhatsApp, sube el PDF: se cargan los 3 turnos del día.</span>
      <input ref={ref} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => subir(e.target.files?.[0])} />
      <button onClick={() => ref.current?.click()} disabled={busy} className="px-4 py-2.5 min-h-[44px] md:min-h-0 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}{busy ? "Leyendo nombrada…" : "Subir nombrada (PDF)"}
      </button>
      {msg && <span className={"text-xs rounded-md px-3 py-2 " + (msg.ok ? "text-[#16386a] bg-[#e2f4f4]" : "text-[#9b3b2e] bg-[#f6e4e0]")}>{msg.text}</span>}
    </div>
  );
}