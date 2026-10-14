import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { card } from "@/lib/apr";
import { downloadCsv, printPdf, downloadConsolidado } from "@/lib/exportReport";
import BarList from "@/components/apr/BarList";
import ClosedTable from "@/components/apr/ClosedTable";

export default function Reportes() {
  const { day } = useOutletContext();
  const mes = day.fecha.slice(0, 7);
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["day", day.fecha, "closed", mes],
    queryFn: async () => (await base44.entities.Programacion.filter({ estado: "cerrada", fecha: { $gte: mes + "-01", $lte: mes + "-31" } }, { sort: "-fecha", limit: 100 })).items,
  });
  if (isLoading) return <div className="py-24 grid place-items-center"><div className="w-7 h-7 border-[3px] border-[#cdd4d4] border-t-[#007f80] rounded-full animate-spin" /></div>;

  const sum = (f) => plans.reduce((s, p) => s + (p[f] || 0), 0);
  const pct = sum("r_prog") - sum("r_na") > 0 ? Math.round((sum("r_ok") / (sum("r_prog") - sum("r_na"))) * 100) : 0;
  const mot = {}; plans.forEach((p) => Object.entries(p.r_motivos || {}).forEach(([m, v]) => (mot[m] = (mot[m] || 0) + v)));
  const by = {}; plans.forEach((p) => { const b = (by[p.asesor] ||= { ok: 0, base: 0 }); b.ok += p.r_ok || 0; b.base += (p.r_prog || 0) - (p.r_na || 0); });
  const kpis = [["Turnos cerrados", plans.length, "este mes"], ["Cumplimiento", pct + "%", "ejecutadas / (programadas − no ocurrió)"], ["Actividades ejecutadas", sum("r_ok"), `de ${sum("r_prog")} programadas`], ["Novedades", sum("r_novs"), "registradas en el mes"]];

  const detail = async (p, fn) => {
    const [e, n] = await Promise.all([base44.entities.Ejecucion.filter({ programacion_id: p.id }, { limit: 200 }), base44.entities.Novedad.filter({ programacion_id: p.id }, { limit: 100 })]);
    fn(p, day.catalog, e.items, n.items);
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(([l, v, n]) => (
          <div key={l} className={card + " border-t-[3px] !border-t-[#00abac] px-4 py-3.5 flex flex-col gap-1"}>
            <span className="text-xs text-[#6b7778]">{l}</span><span className="font-mono text-[28px] font-medium">{v}</span><span className="text-xs text-[#6b7778]">{n}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-5">
        <BarList title="Motivos de no ejecución" rows={Object.entries(mot).sort((a, b) => b[1] - a[1])} />
        <BarList title="Cumplimiento por asesor" suffix="%" max={100} rows={Object.entries(by).map(([a, b]) => [a, b.base ? Math.round((b.ok / b.base) * 100) : 0]).sort((a, b) => b[1] - a[1])} />
      </div>
      <ClosedTable plans={plans} onCsv={(p) => detail(p, downloadCsv)} onPdf={(p) => detail(p, printPdf)} onConsolidado={() => downloadConsolidado(plans)} />
    </>
  );
}