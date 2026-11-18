import { useState } from "react";
import { Loader2, Trash2, ChevronDown, CalendarClock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { card, now, today, shortDate } from "@/lib/apr";
import { attempt } from "@/lib/safe";
import { EST_T, PRIO, inp, btnP } from "@/lib/coord";

export default function TareaCoordCard({ t, onSaved, jefe }) {
  const { user } = useAuth();
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const venc = t.estado !== "completada" && t.fecha_limite && t.fecha_limite < today();
  const avs = t.avances || [];
  const upd = async (data, ok) => { setBusy(true); const r = await attempt(() => base44.entities.TareaCoordinador.update(t.id, data), ok, "No se pudo actualizar la tarea"); setBusy(false); if (r) onSaved(); return r; };
  const avance = async () => { if (txt.trim() && await upd({ avances: [...avs, { fecha: today(), hora: now(), texto: txt.trim(), autor: user?.full_name || "" }], ...(t.estado === "pendiente" ? { estado: "en_curso" } : {}) }, "Avance registrado")) { setTxt(""); setOpen(true); } };
  const del = () => confirm(`¿Eliminar la tarea "${t.titulo}"?`) && attempt(async () => { await base44.entities.TareaCoordinador.delete(t.id); onSaved(); }, "Tarea eliminada", "No se pudo eliminar");
  return (
    <div className={card + " p-4 flex flex-col gap-3 " + (venc ? "border-l-4 border-l-[#c0392b]" : "")}>
      <div className="flex justify-between gap-3 items-start">
        <div className="min-w-0">
          <div className="font-medium text-[15px]">{t.titulo}</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#5b6b80] mt-1">
            <span>{t.origen === "jefatura" ? `Asignada por ${t.asignado_por || "Jefatura"}` : "Tarea propia"}</span>
            {jefe && <span className="text-[#16386a]">{t.asignado_nombre}</span>}
            <span className={PRIO[t.prioridad]?.[1]}>{PRIO[t.prioridad]?.[0]}</span>
            {t.fecha_limite && <span className={"inline-flex items-center gap-1 " + (venc ? "text-[#9b2c1f] font-medium" : "")}><CalendarClock className="w-3.5 h-3.5" />{venc ? "Vencida " : "Vence "}{shortDate(t.fecha_limite)}</span>}
          </div>
        </div>
        {busy ? <Loader2 className="w-4 h-4 animate-spin text-[#2a64b8]" /> : (jefe || t.created_by_id === user?.id) && <button onClick={del} aria-label="Eliminar tarea"><Trash2 className="w-4 h-4 text-[#9b3b2e]" /></button>}
      </div>
      {t.descripcion && <p className="text-sm text-[#3c4849] whitespace-pre-wrap">{t.descripcion}</p>}
      <div className="inline-flex p-1 rounded-lg bg-[#f5f8fc] border border-[#e3e9f1] self-start">
        {Object.entries(EST_T).map(([k, [l, cls]]) => <button key={k} disabled={busy} onClick={() => k !== t.estado && upd({ estado: k })} className={"px-3 py-1.5 rounded-md text-xs font-medium transition-colors " + (t.estado === k ? cls : "text-[#5b6b80] hover:bg-white")}>{l}</button>)}
      </div>
      <div className="flex gap-2">
        <input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && avance()} placeholder="Registrar un avance…" className={inp} />
        <button onClick={avance} disabled={busy || !txt.trim()} className={btnP}>Registrar</button>
      </div>
      {avs.length > 0 && <button onClick={() => setOpen(!open)} className="text-sm text-[#2a64b8] inline-flex items-center gap-1 self-start">{avs.length} avance{avs.length > 1 ? "s" : ""} <ChevronDown className={"w-4 h-4 transition-transform " + (open ? "rotate-180" : "")} /></button>}
      {open && <ul className="flex flex-col gap-2 border-l-2 border-[#dbe7f7] pl-3">
        {[...avs].reverse().map((a, i) => <li key={i} className="text-sm"><span className="font-mono text-xs text-[#2a64b8]">{shortDate(a.fecha)} {a.hora}</span> <span className="text-xs text-[#5b6b80]">· {a.autor}</span><div className="whitespace-pre-wrap">{a.texto}</div></li>)}
      </ul>}
    </div>
  );
}