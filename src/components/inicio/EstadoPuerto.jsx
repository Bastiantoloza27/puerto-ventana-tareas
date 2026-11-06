import { useQuery } from "@tanstack/react-query";
import { Anchor, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RestriccionesQuintero from "@/components/inicio/RestriccionesQuintero";

const Estado = ({ label, activo }) => (
  <div className={"flex-1 rounded-md px-3 py-2 " + (activo ? "bg-[#fbf3dc] text-[#7a5d0e]" : "bg-[#eaf5ec] text-[#2f7a3c]")}>
    <div className="text-[11px] font-mono tracking-[.06em]">{label}</div>
    <div className="text-sm font-medium">{activo ? "Vigente" : "Sin aviso"}</div>
  </div>
);

export default function EstadoPuerto() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estado-puerto"],
    queryFn: async () => (await base44.functions.invoke("estadoPuerto", {})).data,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  return (
    <div className="bg-white border border-[#dde3ec] rounded-[10px] p-4 flex flex-col gap-3 shadow-[0_1px_2px_rgba(15,35,64,.05),0_6px_18px_rgba(15,35,64,.05)]">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-[#eef4fb] text-[#16386a] grid place-items-center"><Anchor className="w-4 h-4" /></span>
        <div className="min-w-0 flex-1"><div className="font-heading text-lg leading-tight">Estado de la Capitanía de Puerto</div>
          <div className="text-xs text-[#6b7778]">Armada · SITPORT · Quintero{data?.consultado ? ` · actualizado ${data.consultado}` : ""}</div></div>
      </div>
      {isLoading && <div className="flex items-center gap-2 text-xs text-[#6b7778]"><Loader2 className="w-4 h-4 animate-spin" />Consultando avisos de la Armada…</div>}
      {isError && <div className="text-xs text-[#9b3b2e]">No se pudieron obtener los avisos meteorológicos.</div>}
      {data && (
        <>
          <div className="flex gap-2"><Estado label="1. MAL TIEMPO" activo={data.malTiempo} /><Estado label="2. MAREJADAS" activo={data.marejadas} /></div>
          {data.avisos.map((a) => (
            <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="text-xs text-[#3c4849] hover:text-[#2a64b8]">
              <span className="font-medium">{a.descripcion}</span> · {a.zona} · <span className="font-mono">{a.fecha}</span>
            </a>
          ))}
        </>
      )}
      <div className="border-t border-[#eef1f1] pt-3"><div className="text-[11px] font-mono tracking-[.06em] text-[#6b7778] mb-1.5">RESTRICCIONES · CIERRE/APERTURA</div><RestriccionesQuintero /></div>
    </div>
  );
}