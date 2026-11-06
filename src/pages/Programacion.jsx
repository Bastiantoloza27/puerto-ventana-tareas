import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { card, chipCls, ASES, SH, now } from "@/lib/apr";
import { addLog, upsertPlan, sendProgram } from "@/lib/aprActions";
import { attempt } from "@/lib/safe";
import { agregarEnvio, envioLabel } from "@/lib/opsMail";
import { downloadProgramaCsv, printProgramaPdf } from "@/lib/exportReport";
import CatalogPicker from "@/components/apr/CatalogPicker";
import OpsMailPanel from "@/components/apr/OpsMailPanel";
import OpsMailInbox from "@/components/apr/OpsMailInbox";

export default function Programacion() {
  const { day, shift, plan, canPlan } = useOutletContext();
  const readOnly = !canPlan;
  const [ids, setIds] = useState([]);
  const [asesor, setAsesor] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");
  useEffect(() => { setIds(plan?.actividad_ids || []); setAsesor(plan?.asesor || null); setErr(""); }, [plan?.id, shift]);

  const locked = plan?.estado === "cerrada" || readOnly;
  const pub = plan?.estado === "publicada";
  const toggle = (id) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const copyPrev = async () => {
    setBusy(true); setErr("");
    await attempt(async () => {
      const prev = (await base44.entities.Programacion.filter({ turno: shift, fecha: { $lt: day.fecha }, estado: { $ne: "borrador" } }, { sort: "-fecha", limit: 1 })).items[0];
      if (prev) { setIds((s) => [...new Set([...s, ...(prev.actividad_ids || []).filter((id) => day.catalog.some((c) => c.id === id))])]); if (!asesor) setAsesor(prev.asesor); }
      else setErr("No hay una programación anterior de este turno.");
    }, null, "No se pudo copiar la programación anterior");
    setBusy(false);
  };

  const programPlan = () => ({ ...(plan || {}), fecha: day.fecha, turno: shift, asesor, actividad_ids: ids });

  const sendMail = async () => {
    setBusy(true); setErr(""); setSent("");
    await attempt(async () => {
      const p = await upsertPlan(plan, day.fecha, shift, { asesor, actividad_ids: ids });
      setSent(await sendProgram(p.id));
    }, null, "No se pudo enviar el correo");
    day.refresh(); setBusy(false);
  };

  const onParsed = (r) => attempt(async () => {
    const hora = r.hora || now();
    const prev = plan?.correo;
    const correo = agregarEnvio(prev, { asunto: r.asunto, hora, remitente: r.remitente, lineas: r.lineas });
    const etiqueta = envioLabel(correo.envios.length);
    const nuevas = r.lineas.map((l) => l.actividad_id).filter(Boolean);
    const nextIds = [...new Set([...ids, ...nuevas])];
    const nextAsesor = asesor || r.asesor || null;
    const p = await upsertPlan(plan, day.fecha, shift, { correo, actividad_ids: nextIds, asesor: nextAsesor });
    const sinMatch = r.lineas.filter((l) => !l.actividad_id).length;
    await addLog(p, `${etiqueta} de Operaciones (${hora}) cargada · ${nuevas.length} sugeridas${sinMatch ? ` · ${sinMatch} sin asociar` : ""}`);
    setIds(nextIds); setAsesor(nextAsesor);
    day.refresh();
    return p.id;
  }, null, "No se pudo cargar el correo de Operaciones");

  const save = async (publish) => {
    if (publish && (!asesor || !ids.length)) return setErr(!asesor ? "Asigna un asesor de turno antes de publicar." : "Selecciona al menos una actividad.");
    setBusy(true); setErr(""); setSent("");
    const data = { asesor, actividad_ids: ids, ...(publish ? { estado: "publicada", publicada_hora: now() } : {}) };
    const p = await attempt(async () => {
      const saved = await upsertPlan(plan, day.fecha, shift, data);
      await addLog(saved, publish ? `${pub ? "Programación republicada" : "Programación publicada"} · ${ids.length} actividades · ${asesor}` : "Borrador guardado");
      return saved;
    }, publish ? (pub ? "Programación republicada" : "Programación publicada") : "Borrador guardado");
    if (p && publish) await attempt(async () => setSent(await sendProgram(p.id)), null, "Quedó publicada, pero no se pudo enviar el correo al asesor");
    day.refresh(); setBusy(false);
  };

  return (
    <div className="flex flex-wrap gap-5 items-start">
      <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-4">
        <div className={card + " p-4 flex flex-col gap-3"}>
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <span className="font-heading text-xl">Asesor del {SH[shift].name}</span>
            <span className={"text-xs px-2.5 py-1 rounded-xl " + (locked ? "bg-[#eef1f1] text-[#5b6667]" : pub ? "bg-[#e2f4f4] text-[#16386a]" : "bg-[#fbf3dc] text-[#7a5d0e]")}>
              {plan?.estado === "cerrada" ? "Turno cerrado" : pub ? `Publicada ${plan.publicada_hora}` : "Borrador"}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">{ASES.map((a) => <button key={a} disabled={locked} onClick={() => setAsesor(a)} className={chipCls(asesor === a)}>{a}</button>)}</div>
        </div>
        <CatalogPicker catalog={day.catalog} ids={ids} toggle={toggle} locked={locked} />
      </div>
      <div className="w-full md:flex-[0_1_380px] md:min-w-[280px] flex flex-col gap-4 lg:sticky lg:top-6">
        {ids.length > 0 && (
          <div className={card + " p-4 flex flex-col gap-2.5"}>
            <span className="font-heading text-lg">Tareas asignadas</span>
            <span className="text-xs text-[#6b7778]">{ids.length} actividades · {asesor || "sin asesor"}</span>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => printProgramaPdf(programPlan(), day.catalog)} className="flex-1 px-3 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md text-sm md:text-[13px] border border-[#cdd4d4] hover:border-[#2a64b8]">Descargar PDF</button>
              <button onClick={() => downloadProgramaCsv(programPlan(), day.catalog)} className="flex-1 px-3 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md text-sm md:text-[13px] border border-[#cdd4d4] hover:border-[#2a64b8]">Descargar Excel</button>
            </div>
            {!readOnly && <button onClick={sendMail} disabled={busy} className="px-4 py-2.5 rounded-md bg-[#0f2340] hover:bg-[#1b3d3e] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Enviar por correo</button>}
            {sent && <span className="text-xs text-[#16386a] bg-[#e2f4f4] rounded-md px-3 py-2">{sent}</span>}
          </div>
        )}
        <OpsMailInbox locked={locked} onApply={(c) => onParsed({ asunto: c.asunto, asesor: c.asesor, lineas: c.lineas, texto: c.texto, remitente: c.remitente, hora: c.recibido ? new Date(c.recibido).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : null })} />
        <OpsMailPanel plan={plan} catalog={day.catalog} ids={ids} locked={locked} onApply={(m) => setIds((s) => [...s, ...m])} onParsed={onParsed} />
        {!locked && (
          <div className={card + " p-4 flex flex-col gap-3"}>
            <button onClick={copyPrev} disabled={busy} className="px-4 py-2.5 rounded-md text-sm border border-[#cdd4d4] hover:border-[#2a64b8] text-[#1c2526]">Copiar programación anterior del {SH[shift].name}</button>
            <div className="flex justify-between text-[13px]"><span className="text-[#6b7778]">Actividades seleccionadas</span><span className="font-mono">{ids.length}</span></div>
            {err && <div className="text-xs text-[#9b3b2e] bg-[#f6e4e0] rounded-md px-3 py-2">{err}</div>}
            <button onClick={() => save(true)} disabled={busy} className="px-4 py-2.5 rounded-md bg-[#2a64b8] hover:bg-[#16386a] text-white text-sm flex items-center justify-center gap-2 transition-colors">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}{pub ? "Republicar" : "Publicar"} y notificar al asesor
            </button>
            <button onClick={() => save(false)} disabled={busy} className="px-4 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-md text-sm text-[#3c4849] hover:bg-[#eef1f1]">Guardar borrador</button>
            {pub && <span className="text-[11px] text-[#6b7778]">Republicar queda registrado en la bitácora del turno.</span>}
          </div>
        )}
      </div>
    </div>
  );
}