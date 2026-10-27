import { Link } from "react-router-dom";
import { card } from "@/lib/apr";
import MinimosPanel from "@/components/apr/MinimosPanel";

export default function TurnoSide({ plan, k, fecha, readOnly }) {
  const closed = plan.estado === "cerrada";
  return (
    <div className="w-full md:flex-[0_1_340px] md:min-w-[280px] flex flex-col gap-4 lg:sticky lg:top-6">
      <div className={card + " p-4 flex flex-col gap-3"}>
        <div className="font-heading text-xl">Cierre del turno</div>
        <div className="flex justify-between text-[13px]"><span className="text-[#6b7778]">Registradas</span><span className="font-mono">{k.prog - k.pendList.length}/{k.prog}</span></div>
        <div className="h-1.5 rounded bg-[#eef1f1] overflow-hidden"><div className="h-full bg-[#00abac] transition-all duration-500" style={{ width: k.prog ? ((k.prog - k.pendList.length) / k.prog) * 100 + "%" : 0 }} /></div>
        {k.pendList.length > 0 && !closed && <div className="text-xs text-[#7a5d0e] bg-[#fbf3dc] rounded-md px-3 py-2">Faltan {k.pendList.length} registro(s) para poder cerrar.</div>}
        <Link to="/cierre" className="text-center px-4 py-3 md:py-2.5 min-h-[44px] md:min-h-0 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm transition-colors">{closed ? "Ver reporte" : "Novedades y cierre"}</Link>
      </div>
      <MinimosPanel asesor={plan.asesor} fecha={fecha} readOnly={readOnly} />
      <div className={card + " p-4 flex flex-col gap-2"}>
        <div className="font-heading text-xl">Bitácora</div>
        {(plan.bitacora || []).slice(0, 8).map((l, i) => (
          <div key={i} className="flex gap-3 text-[13px] border-b border-[#eef1f1] pb-1.5 last:border-0"><span className="font-mono text-xs text-[#6b7778] pt-px">{l.hora}</span><span className="text-[#3c4849]">{l.texto}</span></div>
        ))}
      </div>
    </div>
  );
}