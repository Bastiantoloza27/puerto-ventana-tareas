import { useQuery } from "@tanstack/react-query";
import { Sun, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UvGrafico from "@/components/inicio/UvGrafico";

const COLOR = { bajo: "bg-[#3c9a4b]", moderado: "bg-[#d9b200]", alto: "bg-[#e07b16]", "muy alto": "bg-[#c8352b]", extremo: "bg-[#7b3fa0]" };
const bg = (r) => COLOR[String(r).toLowerCase()] || "bg-[#5b6667]";

export default function IndiceUv() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["indice-uv"],
    queryFn: async () => (await base44.functions.invoke("indiceUv", {})).data,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
  });
  const hoy = data?.hoy;
  const p = data?.pronostico;

  return (
    <div className="bg-white border border-[#dde3ec] rounded-[10px] p-4 flex flex-col gap-3 shadow-[0_1px_2px_rgba(15,35,64,.05),0_6px_18px_rgba(15,35,64,.05)]">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-[#fbf3dc] text-[#b07a00] grid place-items-center"><Sun className="w-4 h-4" /></span>
        <div className="min-w-0 flex-1"><div className="font-heading text-lg leading-tight">Índice UV de hoy</div>
          <div className="text-xs text-[#6b7778]">Meteochile · Litoral Central{data?.consultado ? ` · actualizado ${data.consultado}` : ""}</div></div>
      </div>
      {isLoading && <div className="flex items-center gap-2 text-xs text-[#6b7778]"><Loader2 className="w-4 h-4 animate-spin" />Consultando Meteochile…</div>}
      {isError && <div className="text-xs text-[#9b3b2e]">No se pudo obtener el índice UV.</div>}
      {data && !hoy && <div className="text-xs text-[#6b7778]">Aún no hay mediciones de hoy.</div>}
      {hoy && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5">
            <span className={"text-white font-mono text-2xl rounded-lg px-3 py-1.5 " + bg(hoy.actual.riesgo)}>{hoy.actual.valor}</span>
            <div className="flex flex-col"><span className="text-sm font-medium">{hoy.actual.riesgo}</span><span className="text-xs text-[#6b7778]">Ahora · {hoy.actual.hora}</span></div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={"text-white font-mono text-2xl rounded-lg px-3 py-1.5 " + bg(hoy.maximo.riesgo)}>{hoy.maximo.valor}</span>
            <div className="flex flex-col"><span className="text-sm font-medium">{hoy.maximo.riesgo}</span><span className="text-xs text-[#6b7778]">Máximo · {hoy.maximo.hora}</span></div>
          </div>
        </div>
      )}
      {hoy?.horas?.length > 0 && <UvGrafico horas={hoy.horas} />}
      {p && <div className="text-xs text-[#6b7778]">Pronóstico Meteochile: <span className="font-mono">{p.valor}</span> ({p.riesgo})</div>}
      {data?.recomendaciones?.length > 0 && (
        <ul className="text-xs text-[#3c4849] list-disc pl-4 flex flex-col gap-0.5">{data.recomendaciones.map((r) => <li key={r}>{r}</li>)}</ul>
      )}
    </div>
  );
}