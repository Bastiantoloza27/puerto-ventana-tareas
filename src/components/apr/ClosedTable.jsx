import { FileSpreadsheet, FileText } from "lucide-react";
import { card, SH, shortDate } from "@/lib/apr";

export default function ClosedTable({ plans, onCsv, onPdf, onConsolidado }) {
  return (
    <div className={card + " overflow-hidden"}>
      <div className="flex justify-between items-center px-4 py-3 border-b border-[#eef1f1] flex-wrap gap-2">
        <span className="font-heading text-xl">Turnos cerrados</span>
        <button onClick={onConsolidado} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#cdd4d4] text-[13px] hover:border-[#007f80]"><FileSpreadsheet className="w-4 h-4 text-[#007f80]" />Consolidado mensual</button>
      </div>
      <div className="overflow-x-auto">
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
                <td className="px-4 py-2 font-mono" style={{ color: p.r_pct >= 85 ? "#005f60" : "#7a5d0e" }}>{p.r_pct}%</td>
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