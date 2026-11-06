import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, Unlock, ExternalLink } from "lucide-react";

// SITPORT solo responde desde Chile, por eso se consulta directo desde el navegador.
const API = "https://orion.directemar.cl/sitport/back/users/";
const post = async (p) => {
  const r = await fetch(API + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()).recordset || [];
};
const fecha = (s) => (s ? new Date(s).toLocaleString("es-CL", { timeZone: "UTC", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : "");

export default function RestriccionesQuintero() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sitport-quintero"],
    queryFn: async () => {
      const [bahias, rest] = await Promise.all([post("consultaBahias"), post("consultaRestricciones")]);
      const ids = bahias.filter((b) => /QUINTERO/i.test(b.NMBahia)).map((b) => b.IDBahia);
      return rest.filter((r) => ids.includes(r.bahia));
    },
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
    retry: 1,
  });

  if (isLoading) return <div className="flex items-center gap-2 text-xs text-[#6b7778]"><Loader2 className="w-4 h-4 animate-spin" />Consultando SITPORT…</div>;
  if (isError) return (
    <a href="https://sitport.directemar.cl/#/general" target="_blank" rel="noreferrer" className="text-xs text-[#2a64b8] hover:underline flex items-center gap-1">
      No se pudo leer SITPORT desde aquí · Ver restricciones de Quintero <ExternalLink className="w-3 h-3" />
    </a>
  );
  if (!data.length) return <div className="flex items-center gap-2 text-sm text-[#2f7a3c]"><Unlock className="w-4 h-4" />Bahía de Quintero sin restricciones · puerto abierto</div>;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-[#9b3b2e]"><Lock className="w-4 h-4" />{data.length} restricción(es) vigente(s) en Quintero</div>
      {data.map((r, i) => (
        <div key={i} className="rounded-md bg-[#f6e4e0] px-3 py-2 text-xs text-[#5a2a22] flex flex-col gap-0.5">
          <span className="font-medium">{r.tipo} · {r.NombreInstalacion}</span>
          {r.NaveRecibe && <span>Naves: {r.NaveRecibe}</span>}
          {r.AreaRestriccion && <span>Área: {r.AreaRestriccion}</span>}
          {r.Observacion && <span>{r.Observacion}</span>}
          <span className="text-[#9b3b2e]">Desde {fecha(r.FCinicio)}</span>
        </div>
      ))}
    </div>
  );
}