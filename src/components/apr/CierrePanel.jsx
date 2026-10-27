import { useEffect, useState } from "react";
import { Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { card, SH, nextShift } from "@/lib/apr";

export default function CierrePanel({ plan, k, readOnly, nextAsesor, onEntrega, onClose, onCsv, onPdf }) {
  const [entrega, setEntrega] = useState(plan.entrega || "");
  const [busy, setBusy] = useState(false);
  useEffect(() => setEntrega(plan.entrega || ""), [plan.id]);
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
        <textarea rows={4} value={entrega} disabled={closed || readOnly} onChange={(e) => setEntrega(e.target.value)} onBlur={() => entrega !== (plan.entrega || "") && onEntrega(entrega)} placeholder="Pendientes y avisos para el asesor entrante…" className="w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#007f80]" />
        <div className="text-xs text-[#6b7778]">El reporte se envía a Jefatura de Prevención, Gerencia de Operaciones y {nextAsesor}.</div>
        {closed ? (
          <div className="text-sm text-[#005f60] bg-[#e2f4f4] rounded-md px-3 py-2">✓ Turno cerrado a las {plan.cerrada_hora} · reporte enviado</div>
        ) : readOnly ? null : (
          <button onClick={close} disabled={!k.ready || busy} className="px-4 py-2.5 rounded-md bg-[#0e2a2b] hover:bg-[#1b4a4a] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-[#0e2a2b] transition-colors">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}Cerrar turno y enviar reporte
          </button>
        )}
        <div className="flex gap-2">
          <button onClick={onCsv} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md border border-[#cdd4d4] text-sm md:text-[13px] hover:border-[#007f80]"><FileSpreadsheet className="w-4 h-4 text-[#007f80]" />Excel</button>
          <button onClick={onPdf} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md border border-[#cdd4d4] text-sm md:text-[13px] hover:border-[#007f80]"><FileText className="w-4 h-4 text-[#007f80]" />PDF</button>
        </div>
      </div>
    </div>
  );
}