import { FileSpreadsheet, FileText } from "lucide-react";
import { card, SH, shortDate } from "@/lib/apr";

const pctColor = (p) => (p >= 85 ? "#005f60" : "#7a5d0e");

export default function ClosedTable({ plans, onCsv, onPdf, onConsolidado }) {
  return (
    <div className={card + " overflow-hidden"}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 px-4 py-3 border-b border-[#eef1f1]">
        <span className="font-heading text-xl">Turnos cerrados</span>
        <button onClick={onConsolidado} className="flex items-center justify-center gap-1.5 min-h-[44px] md:min-h-0 px-3 py-2.5 md:py-1.5 rounded-md border border-[#cdd4d4] text-sm md:text-[13px] hover:border-[#007f80]"><FileSpreadsheet className="w-4 h-4 text-[#007f80]" />Consolidado mensual</button>
      </div>

      {/* Teléfono: una tarjeta por turno */}
      <div className="md:hidden">
        {!plans.length && <div className="px-4 py-5 text-sm text-[#6b7778]">Sin turnos cerrados este mes.</div>}
        {plans.map((p) => (
          <div key={p.id} className="flex flex-col gap-3 px-4 py-4 border-b border-[#eef1f1] last:border-0">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{SH[p.turno].name} · <span className="font-mono">{shortDate(p.fecha)}</span></div>
                <div className="text-xs text-[#6b7778] truncate">{p.asesor}</div>
                <div className="text-xs text-[#6b7778]">Cierre {p.cerrada_hora}</div>
              </div>
              <span className="font-mono text-[22px] leading-none" style={{ color: pctColor(p.r_pct) }}>{p.r_pct}%</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[["Prog.", p.r_prog], ["Ejec.", p.r_ok], ["No ejec.", p.r_no], ["Noved.", p.r_novs]].map(([l, v]) => (
                <div key={l} className="rounded-md bg-[#f4faf9] py-1.5">
                  <div className="font-mono text-sm">{v}</div>
                  <div className="text-[10px] text-[#6b7778]">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onCsv(p)} className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-md border border-[#cdd4d4] text-sm hover:border-[#007f80]"><FileSpreadsheet className="w-4 h-4 text-[#007f80]" />Excel</button>
              <button onClick={() => onPdf(p)} className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-md border border-[#cdd4d4] text-sm hover:border-[#007f80]"><FileText className="w-4 h-4 text-[#007f80]" />PDF</button>
            </div>
          </div>
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-xs text-[#6b7778]">{["Fecha", "Turno", "Asesor", "Prog.", "Ejec.", "No ejec.", "Cumpl.", "Novedades", "Cierre", ""].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-[#eef1f1] hover:bg-[#f4faf9]">
                <td className="px-4 py-2 font-mono">{shortDate(p.fecha)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{SH[p.turno].name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.asesor}</td>
                <td className="px-4 py-2 font-mono">{p.r_prog}</td>
                <td className="px-4 py-2 font-mono">{p.r_ok}</td>
                <td className="px-4 py-2 font-mono">{p.r_no}</td>
                <td className="px-4 py-2 font-mono" style={{ color: pctColor(p.r_pct) }}>{p.r_pct}%</td>
                <td className="px-4 py-2 font-mono">{p.r_novs}</td>
                <td className="px-4 py-2 font-mono">{p.cerrada_hora}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button onClick={() => onCsv(p)} title="Excel" className="p-1.5 rounded hover:bg-[#e2f4f4]"><FileSpreadsheet className="w-4 h-4 text-[#007f80]" /></button>
                  <button onClick={() => onPdf(p)} title="PDF" className="p-1.5 rounded hover:bg-[#e2f4f4]"><FileText className="w-4 h-4 text-[#007f80]" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}