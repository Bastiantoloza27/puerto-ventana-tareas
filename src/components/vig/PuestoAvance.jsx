import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { card } from "@/lib/apr";
import { corto, tareasPuesto, avance } from "@/lib/vigilantes";
import Progreso from "@/components/vig/Progreso";
import EvidenceList from "@/components/apr/EvidenceList";
import AjustarTareas from "@/components/vig/AjustarTareas";

const ST = { ok: ["Hecha", "bg-[#e3f4ea] text-[#1f6b40]"], no: ["No se pudo", "bg-[#f8e1de] text-[#9b2c1f]"] };

export default function PuestoAvance({ v, fecha, turno, puesto }) {
  const [open, setOpen] = useState(false);
  const [ajustar, setAjustar] = useState(false);
  const items = tareasPuesto(v, turno, puesto);
  const a = avance(items);
  const quien = [...new Set(v.regs.filter((r) => r.puesto === puesto).map((r) => r.vigilante).filter(Boolean))];
  const ajustado = v.ajustes.some((x) => x.puesto === puesto);
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-medium text-[#16386a]">{corto(puesto)}</div>
          <div className="text-xs text-[#5b6b80]">{quien.length ? quien.join(", ") : "Sin registros aún"}{ajustado && " · ajustado por Jefatura"}</div>
        </div>
        <span className="font-mono text-xl text-[#16386a]">{a.pct}%</span>
      </div>
      <Progreso a={a} />
      <div className="flex gap-3 text-sm">
        <button onClick={() => setOpen(!open)} className="text-[#2a64b8] flex items-center gap-1">Ver tareas <ChevronDown className={"w-4 h-4 transition-transform " + (open ? "rotate-180" : "")} /></button>
        <button onClick={() => setAjustar(true)} className="text-[#2a64b8]">Ajustar tareas</button>
      </div>
      {open && (
        <div className="flex flex-col divide-y divide-[#eef1f1] border-t border-[#eef1f1]">
          {items.map(({ t, reg }) => (
            <div key={t.id} className="py-2 flex flex-col gap-1.5">
              <div className="flex justify-between gap-2 text-sm">
                <span>{t.tarea}</span>
                <span className={"text-[11px] px-2 py-0.5 rounded-full h-fit whitespace-nowrap " + (ST[reg?.estado]?.[1] || "bg-[#eceff3] text-[#5b6b80]")}>{ST[reg?.estado]?.[0] || "Pendiente"}{reg?.hora ? " · " + reg.hora : ""}</span>
              </div>
              {reg?.observaciones && <span className="text-xs text-[#5b6b80]">{reg.observaciones}</span>}
              {reg?.evidencias?.length > 0 && <EvidenceList items={reg.evidencias} />}
            </div>
          ))}
        </div>
      )}
      {ajustar && <AjustarTareas v={v} fecha={fecha} turno={turno} puesto={puesto} actuales={items} onClose={() => setAjustar(false)} />}
    </div>
  );
}