import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Sidebar from "@/components/apr/Sidebar";
import ShiftPills from "@/components/apr/ShiftPills";
import useDay from "@/hooks/useDay";
import { kpi, ORDER } from "@/lib/apr";

const TITLES = { "/": "Mi turno", "/cierre": "Novedades y cierre", "/programacion": "Programación del turno", "/reportes": "Reportes" };

export default function AppLayout() {
  const day = useDay();
  const [shift, setShift] = useState("T1");
  const [clock, setClock] = useState(new Date());
  const { pathname } = useLocation();
  useEffect(() => { const t = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(t); }, []);

  const plan = day.plans[shift];
  const k = kpi(plan, day.execs, day.catalog);
  const novCount = day.novs.filter((n) => n.programacion_id === plan?.id).length;
  const unpub = ORDER.filter((x) => !day.plans[x] || day.plans[x].estado === "borrador").length;
  const eyebrow = format(clock, "EEEE dd·MM·yyyy · HH:mm", { locale: es }).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#edf2f1] text-[#1c2526] font-body">
      <Sidebar turnoBadge={plan?.estado !== "borrador" && k.prog ? `${k.prog - k.pend}/${k.prog}` : ""} novBadge={novCount || ""} progBadge={unpub} />
      <main className="flex-1 min-w-0 px-5 md:px-8 pt-7 pb-10 flex flex-col gap-5 bg-[linear-gradient(180deg,#dcecea_0,#edf2f1_260px)]">
        <div className="flex flex-wrap justify-between items-end gap-3.5">
          <div>
            <div className="font-mono text-xs font-medium text-[#007f80] tracking-[.08em]">{eyebrow}</div>
            <h1 className="font-heading text-[34px] leading-[1.1] mt-1.5">{TITLES[pathname] || "Programa APR"}</h1>
          </div>
          {pathname !== "/reportes" && <ShiftPills day={day} shift={shift} setShift={setShift} />}
        </div>
        {day.loading ? (
          <div className="py-24 grid place-items-center"><div className="w-7 h-7 border-[3px] border-[#cdd4d4] border-t-[#007f80] rounded-full animate-spin" /></div>
        ) : (
          <Outlet context={{ day, shift, plan, k }} />
        )}
      </main>
    </div>
  );
}