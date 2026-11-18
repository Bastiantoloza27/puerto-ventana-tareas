import { Eye } from "lucide-react";
import { card, SH, ORDER, kpi } from "@/lib/apr";

const EST = { borrador: ["Sin publicar", "bg-[#fbf3dc] text-[#7a5d0e]"], publicada: ["En curso", "bg-[#dbe7f7] text-[#16386a]"], cerrada: ["Cerrado", "bg-[#e3f4ea] text-[#1f6b40]"] };

// Vista pasiva: solo muestra el estado de los turnos de hoy, sin controles de programación.
export default function TurnosAsesores({ day }) {
  return (
    <div className={card + " p-4 flex flex-col gap-3"}>
      <div className="flex justify-between items-center">
        <span className="font-heading text-lg">Turnos de asesores</span>
        <span className="text-[11px] text-[#5b6b80] inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Solo lectura</span>
      </div>
      {ORDER.map((t) => {
        const p = day.plans[t];
        const k = kpi(p, day.execs, day.catalog);
        const [lbl, cls] = EST[p?.estado] || ["Sin programar", "bg-[#eceff3] text-[#5b6b80]"];
        const novs = p ? day.novs.filter((n) => n.programacion_id === p.id).length : 0;
        const hechas = k.prog - k.pend;
        return (
          <div key={t} className="rounded-lg border border-[#e3e9f1] p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="text-sm font-medium">{SH[t].name} <span className="text-xs text-[#5b6b80] font-normal">· {SH[t].hours}</span></div>
                <div className="text-xs text-[#5b6b80]">{p?.asesor || "Sin asesor asignado"}{novs ? ` · ${novs} novedad${novs > 1 ? "es" : ""}` : ""}</div>
              </div>
              <span className={"text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap " + cls}>{lbl}</span>
            </div>
            {k.prog > 0 && <>
              <div className="h-2 rounded-full bg-[#e3e9f1] overflow-hidden"><div className="h-full bg-[#2a64b8] transition-all duration-700" style={{ width: (hechas / k.prog) * 100 + "%" }} /></div>
              <div className="text-xs text-[#5b6b80]"><b className="font-mono text-[#16386a]">{hechas}/{k.prog}</b> actividades registradas · {k.pct}% cumplimiento</div>
            </>}
          </div>
        );
      })}
    </div>
  );
}