import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { now, nextShift, SH } from "@/lib/apr";
import { addLog } from "@/lib/aprActions";
import { attempt } from "@/lib/safe";
import { downloadCsv, printPdf } from "@/lib/exportReport";
import NotPublished from "@/components/apr/NotPublished";
import NovedadForm from "@/components/apr/NovedadForm";
import NovedadList from "@/components/apr/NovedadList";
import CierrePanel from "@/components/apr/CierrePanel";

export default function Cierre() {
  const { day, shift, plan, k, readOnly } = useOutletContext();
  if (!plan || plan.estado === "borrador") return <NotPublished shift={shift} />;
  const novs = day.novs.filter((n) => n.programacion_id === plan.id);
  const execs = day.execs.filter((e) => e.programacion_id === plan.id);
  const nextAsesor = day.plans[nextShift(shift)]?.asesor || "asesor por asignar";
  const closed = plan.estado === "cerrada";

  const saveNov = (data) => attempt(async () => {
    await base44.entities.Novedad.create({ programacion_id: plan.id, hora: now(), ...data });
    await addLog(plan, `Novedad registrada en ${data.lugar} · ${data.criticidad.toLowerCase()}`);
    day.refresh();
  }, "Novedad registrada");
  const saveEntrega = (entrega) => attempt(async () => { await base44.entities.Programacion.update(plan.id, { entrega }); day.refresh(); });
  const close = async (entrega) => {
    const hora = now();
    const ok = await attempt(async () => {
      await base44.entities.Programacion.update(plan.id, { entrega, estado: "cerrada", cerrada_hora: hora, r_prog: k.prog, r_ok: k.ok, r_no: k.no, r_na: k.na, r_pct: k.pct, r_novs: novs.length, r_motivos: k.motivos });
      await addLog(plan, "Turno cerrado · reporte enviado");
    }, null, "No se pudo cerrar el turno");
    if (!ok) return;
    await attempt(async () => {
      const res = await base44.functions.invoke("sendShiftReport", { programacion_id: plan.id });
      toast({ title: `${SH[shift].name} cerrado`, description: `Reporte enviado a ${res.data?.sent || 0} destinatario(s): Prevención de Riesgos y asesor del turno siguiente` });
    }, null, "El turno quedó cerrado, pero el reporte no se pudo enviar");
    day.refresh();
  };
  const updateNov = (n, d) => attempt(async () => { await base44.entities.Novedad.update(n.id, d); await addLog(plan, `Novedad editada en ${d.lugar}`); day.refresh(); }, "Novedad actualizada");
  const deleteNov = (n) => attempt(async () => { await base44.entities.Novedad.delete(n.id); await addLog(plan, `Novedad eliminada en ${n.lugar}`); day.refresh(); }, null, "No se pudo eliminar la novedad");

  return (
    <div className="flex flex-wrap gap-5 items-start">
      <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-5">
        {!closed && !readOnly && <NovedadForm shift={shift} asesor={plan.asesor} onSave={saveNov} />}
        <NovedadList novs={novs} editable={!closed && !readOnly}
          onUpdate={updateNov} onDelete={deleteNov} />
      </div>
      <CierrePanel plan={plan} k={k} readOnly={readOnly} nextAsesor={nextAsesor} onEntrega={saveEntrega} onClose={close}
        onCsv={() => downloadCsv(plan, day.catalog, execs, novs, k)} onPdf={() => printPdf(plan, day.catalog, execs, novs, k)} />
    </div>
  );
}