import { Mail } from "lucide-react";
import { card } from "@/lib/apr";
import PasteMailBox from "@/components/apr/PasteMailBox";
import OpsMailEnvio from "@/components/apr/OpsMailEnvio";

export default function OpsMailPanel({ plan, catalog, ids, onApply, locked, onParsed }) {
  const m = plan?.correo;
  const envios = m?.envios || (m ? [{ n: 1, asunto: m.asunto, hora: m.hora, lineas: m.lineas || [] }] : []);
  const name = (id) => { const a = catalog.find((c) => c.id === id); return a ? `${a.proceso} · ${a.sitio}` : ""; };
  const sug = new Set(catalog.filter((c) => c.base).map((c) => c.id));
  (m?.lineas || []).forEach((l) => l.actividad_id && sug.add(l.actividad_id));
  if (m?.actualizacion?.actividad_id) sug.add(m.actualizacion.actividad_id);
  const missing = [...sug].filter((id) => !ids.includes(id));

  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-[#e2f4f4] text-[#2a64b8] grid place-items-center flex-none"><Mail className="w-4 h-4" /></span>
        <div className="min-w-0"><div className="font-heading text-xl leading-tight">Correo de Operaciones</div>
          <div className="text-xs text-[#6b7778]">{m ? <>{envios.length === 1 ? "1 correo" : `${envios.length} correos`} · último a las <span className="font-mono">{envios[envios.length - 1].hora}</span></> : "Aún no llega el correo de este turno"}</div></div>
      </div>
      {[...envios].reverse().map((e, i) => <OpsMailEnvio key={e.n} envio={e} ultimo={envios.length > 1 && i === 0} name={name} ids={ids} />)}
      {m?.actualizacion && (
        <div className="rounded-lg bg-[#fbf3dc] border border-[#c9b98a] px-3 py-2.5 text-[13px] text-[#7a5d0e]">
          <div className="font-mono text-[11px] tracking-[.08em] mb-0.5">ACTUALIZACIÓN · {m.actualizacion.hora}</div>
          {m.actualizacion.texto}
        </div>
      )}
      {!locked && onParsed && <PasteMailBox isUpdate={!!m} onParsed={onParsed} />}
      {!locked && (
        <button disabled={!missing.length} onClick={() => onApply(missing)} className="px-4 py-2.5 rounded-md text-sm border border-[#2a64b8] text-[#16386a] bg-white hover:bg-[#e8f5f5] disabled:opacity-50 disabled:hover:bg-white transition-colors">
          {missing.length ? `Aplicar sugerencias (+${missing.length})` : "Sugerencias aplicadas"}
        </button>
      )}
    </div>
  );
}