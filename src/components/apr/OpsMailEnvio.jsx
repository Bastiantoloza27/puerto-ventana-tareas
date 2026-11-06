import { envioLabel } from "@/lib/opsMail";

export default function OpsMailEnvio({ envio, ultimo, name, ids }) {
  const upd = envio.n > 1;
  return (
    <div className={"rounded-lg border " + (upd ? "border-[#c9b98a]" : "border-[#d6e2f0]")}>
      <div className={"px-3 py-2 rounded-t-lg flex flex-wrap items-center gap-x-2 gap-y-0.5 " + (upd ? "bg-[#fbf3dc] text-[#7a5d0e]" : "bg-[#eef4fb] text-[#16386a]")}>
        <span className="font-mono text-[11px] tracking-[.08em] uppercase">{envioLabel(envio.n)} · {envio.hora}</span>
        {ultimo && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a64b8] text-white">Más reciente</span>}
        <span className="w-full text-xs truncate opacity-80">{envio.asunto}{envio.remitente ? ` · ${envio.remitente}` : ""}</span>
      </div>
      <div className="px-3 py-1">
        {(envio.lineas || []).map((l, i) => (
          <div key={i} className="text-[13px] border-b border-[#eef1f1] py-2 last:border-0">
            <div className="text-[#1c2526]">{l.texto}</div>
            <div className={"text-xs mt-0.5 " + (l.actividad_id ? "text-[#16386a]" : "text-[#7a5d0e] bg-[#fbf3dc] rounded px-1.5 py-0.5 inline-block")}>{l.actividad_id ? "→ " + name(l.actividad_id) + (ids.includes(l.actividad_id) ? " ✓" : "") : "⚠ Sin actividad del catálogo · agrégala a mano si corresponde"}</div>
          </div>
        ))}
        {!envio.lineas?.length && <div className="text-xs text-[#6b7778] py-2">Sin labores detectadas en este correo.</div>}
      </div>
    </div>
  );
}