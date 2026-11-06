import { useEffect, useState } from "react";
import { Loader2, FileSpreadsheet, FileText, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card, SH, nextShift } from "@/lib/apr";

export default function CierrePanel({ plan, k, readOnly, nextAsesor, onEntrega, onClose, onCsv, onPdf }) {
  const [entrega, setEntrega] = useState(plan.entrega || "");
  const [busy, setBusy] = useState(false);
  useEffect(() => setEntrega(plan.entrega || ""), [plan.id]);
  // Autoguardado de la entrega mientras se escribe.
  useEffect(() => {
    if (plan.estado === "cerrada" || readOnly || entrega === (plan.entrega || "")) return;
    const t = setTimeout(() => onEntrega(entrega), 1200);
    return () => clearTimeout(t);
  }, [entrega]);
  const closed = plan.estado === "cerrada";
  const close = async () => { setBusy(true); await onClose(entrega); setBusy(false); };

  return (
    <div className="w-full md:flex-[0_1_380px] md:min-w-[280px] flex flex-col gap-4 lg:sticky lg:top-6">
      <div className={card + " p-4 flex flex-col gap-3"}>
        <div className="font-heading text-xl">Resumen del turno</div>
        {[["Programadas", k.prog], ["Ejecutadas", k.ok], ["No ejecutadas", k.no], ["No ocurrió", k.na], ["Cumplimiento", k.pct + "%"]].map(([l, v]) => (
          <div key={l} className="flex justify-between text-[13px] border-b border-[#eef1f1] pb-1.5 last:border-0"><span className="text-[#6b7778]">{l}</span><span className="font-mono">{v}</span></div>
        ))}
      </div>
      {!closed && k.pendList.length > 0 && (
        <div className="rounded-[10px] bg-[#fbfaf6] border border-[#c9b98a] p-4 flex flex-col gap-1.5">
          <div className="text-sm font-semibold text-[#7a5d0e]">Falta registrar ({k.pendList.length})</div>
          {k.pendList.map((p) => <div key={p} className="text-xs text-[#7a5d0e]">· {p}</div>)}
        </div>
      )}
      <div className={card + " p-4 flex flex-col gap-3"}>
        <div className="font-heading text-xl">Entrega al {SH[nextShift(plan.turno)].name}</div>
        <textarea rows={4} value={entrega} disabled={closed || readOnly} onChange={(e) => setEntrega(e.target.value)} onBlur={() => entrega !== (plan.entrega || "") && onEntrega(entrega)} placeholder="Pendientes y avisos para el asesor entrante…" className="w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#2a64b8]" />
        <div className="text-xs text-[#6b7778]">El reporte se envía a prevencion.riesgos@pvsa.cl y {nextAsesor}.</div>
        {closed ? (
          <>
            <div className="text-sm text-[#16386a] bg-[#e2f4f4] rounded-md px-3 py-2">✓ Turno cerrado a las {plan.cerrada_hora} · reporte enviado</div>
            <button onClick={() => base44.auth.logout(window.location.origin + "/login")} className="min-h-[44px] px-4 py-2.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />Cerrar sesión y entregar el teléfono
            </button>
          </>

        ) : readOnly ? null : (
          <button onClick={close} disabled={!k.ready || busy} className="px-4 py-2.5 rounded-md bg-[#0f2340] hover:bg-[#1c3d68] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-[#0f2340] transition-colors">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}Cerrar turno y enviar reporte
          </button>
        )}
        <div className="flex gap-2">
          <button onClick={onCsv} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md border border-[#cdd4d4] text-sm md:text-[13px] hover:border-[#2a64b8]"><FileSpreadsheet className="w-4 h-4 text-[#2a64b8]" />Excel</button>
          <button onClick={onPdf} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md border border-[#cdd4d4] text-sm md:text-[13px] hover:border-[#2a64b8]"><FileText className="w-4 h-4 text-[#2a64b8]" />PDF</button>
        </div>
      </div>
    </div>
  );
}