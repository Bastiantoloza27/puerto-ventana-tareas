import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { card } from "@/lib/apr";
import { corto, tareasPuesto, avance } from "@/lib/vigilantes";
import Progreso from "@/components/vig/Progreso";
import EvidenceList from "@/components/apr/EvidenceList";

const ST = { ok: ["Ejecutado", "bg-[#e4ecf8] text-[#1d4a8c]"], no: ["No ejecutado", "bg-[#f6e4e0] text-[#9b3b2e]"] };

export default function PuestoAvance({ v, fecha, turno, puesto }) {
  const [open, setOpen] = useState(false);
  const items = tareasPuesto(v, fecha, turno, puesto);
  const a = avance(items);
  const quien = [...new Set(v.regs.filter((r) => r.puesto === puesto).map((r) => r.vigilante).filter(Boolean))];
  const manuales = items.filter((i) => i.t.grupo === "manual").length;
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-medium text-[#16386a]">{corto(puesto)}</div>
          <div className="text-xs text-[#5b6b80]">{quien.length ? quien.join(", ") : "Sin registros aún"}{manuales ? ` · ${manuales} manuales de Jefatura` : ""}</div>
        </div>
        <span className="font-mono text-xl text-[#16386a]">{a.pct}%</span>
      </div>
      <Progreso a={a} />
      <button onClick={() => setOpen(!open)} className="text-sm text-[#2a64b8] flex items-center gap-1 self-start">Ver tareas <ChevronDown className={"w-4 h-4 transition-transform " + (open ? "rotate-180" : "")} /></button>
      {open && (
        <div className="flex flex-col divide-y divide-[#eef1f1] border-t border-[#eef1f1]">
          {items.map(({ t, reg }) => (
            <div key={t.id} className="py-2 flex flex-col gap-1.5">
              <div className="flex justify-between gap-2 text-sm">
                <span>{t.tarea}</span>
                <span className={"text-[11px] px-2 py-0.5 rounded-full h-fit whitespace-nowrap " + (ST[reg?.estado]?.[1] || "bg-[#fbf3dc] text-[#7a5d0e]")}>{ST[reg?.estado]?.[0] || "Por registrar"}{reg?.hora ? " · " + reg.hora : ""}</span>
              </div>
              {reg?.motivo && <span className="text-xs text-[#9b3b2e]">Motivo: {reg.motivo}</span>}
              {reg?.observaciones && <span className="text-xs text-[#5b6b80]">{reg.observaciones}</span>}
              {reg?.evidencias?.length > 0 && <EvidenceList items={reg.evidencias} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}