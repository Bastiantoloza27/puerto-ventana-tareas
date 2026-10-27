import { useState } from "react";
import { Loader2, ClipboardPaste } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ASES } from "@/lib/apr";

export default function PasteMailBox({ isUpdate, onParsed }) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    setBusy(true); setErr("");
    const res = await base44.functions.invoke("parseOpsMail", { texto, asesores: ASES }).catch((e) => ({ data: { error: e.response?.data?.error || e.message } }));
    setBusy(false);
    if (res.data?.error) return setErr(res.data.error);
    await onParsed({ ...res.data, raw: texto });
    setTexto(""); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-md text-sm bg-[#007f80] hover:bg-[#005f60] text-white flex items-center justify-center gap-2">
      <ClipboardPaste className="w-4 h-4" />{isUpdate ? "Pegar actualización de Operaciones" : "Pegar correo de Operaciones"}
    </button>
  );
  return (
    <div className="flex flex-col gap-2">
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={7} placeholder="Copia aquí el texto completo del correo…" className="w-full rounded-md border border-[#cdd4d4] p-2.5 text-[13px] focus:outline-none focus:border-[#007f80]" />
      {err && <div className="text-xs text-[#9b3b2e] bg-[#f6e4e0] rounded-md px-3 py-2">{err}</div>}
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} disabled={busy} className="flex-1 px-3 py-2.5 rounded-md text-sm text-[#3c4849] hover:bg-[#eef1f1]">Cancelar</button>
        <button onClick={run} disabled={busy || !texto.trim()} className="flex-1 px-3 py-2.5 rounded-md text-sm bg-[#007f80] hover:bg-[#005f60] text-white flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}{busy ? "Leyendo correo…" : "Leer y sugerir"}
        </button>
      </div>
    </div>
  );
}