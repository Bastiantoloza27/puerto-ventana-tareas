import { Ship, MapPin, Users } from "lucide-react";
import { actividadesDeFaena } from "@/lib/faenaMatch";

const Persona = ({ rol, nombre }) => nombre ? (
  <div className="text-[13px] leading-snug"><span className="text-[#6b7778]">{rol}: </span><span className="text-[#1c2526]">{nombre}</span></div>
) : null;

export default function FaenaCard({ f, catalog }) {
  const acts = actividadesDeFaena(catalog, f);
  const cargos = Object.entries(f.cargos || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className={"rounded-lg border p-3 flex flex-col gap-2 " + (f.nave ? "border-[#9cc0f0] bg-[#f5f8fc]" : "border-[#dde5e4] bg-white")}>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="font-medium text-sm text-[#16386a]">{f.faena}</div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#5b6667] mt-0.5">
            {f.nave && <span className="flex items-center gap-1"><Ship className="w-3.5 h-3.5" />{f.nave}</span>}
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Sitio {f.sitio}</span>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-mono bg-[#16386a] text-white rounded-md px-2 py-1 flex-none"><Users className="w-3.5 h-3.5" />{f.dotacion}</span>
      </div>
      <Persona rol="Jefe de nave" nombre={f.jefe_nave} />
      <Persona rol="Supervisor" nombre={f.supervisor} />
      <Persona rol="Capataz" nombre={f.capataces} />
      {cargos.length > 1 && <div className="flex flex-wrap gap-1">{cargos.map(([c, n]) => <span key={c} className="text-[11px] bg-[#eef1f1] text-[#3c4849] rounded px-1.5 py-0.5">{n} {c.toLowerCase()}</span>)}</div>}
      <div className="text-xs">
        {acts.length
          ? <span className="text-[#16386a]">→ {acts.map((a) => `${a.sitio} · ${a.proceso}`).join(" / ")}</span>
          : <span className="text-[#7a5d0e]">Sin regla en el catálogo: en Catálogo, agrega «{f.faena}» en «Faenas que activan esta actividad».</span>}
      </div>
    </div>
  );
}