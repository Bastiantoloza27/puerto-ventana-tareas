import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Sidebar from "@/components/apr/Sidebar";
import ShiftPills from "@/components/apr/ShiftPills";
import MobileNav from "@/components/apr/MobileNav";
import useDay from "@/hooks/useDay";
import usePerfil from "@/hooks/usePerfil";
import ViewAsSwitch from "@/components/apr/ViewAsSwitch";
import { kpi, ORDER } from "@/lib/apr";

const TITLES = { "/": "Mi turno", "/cierre": "Novedades y cierre", "/programacion": "Programación del turno", "/reportes": "Reportes", "/catalogo": "Catálogo de actividades", "/usuarios": "Usuarios y perfiles" };

export default function AppLayout() {
  const day = useDay();
  const { readOnly, canPlan } = usePerfil();
  const [shift, setShift] = useState("T1");
  const [clock, setClock] = useState(new Date());
  const { pathname } = useLocation();
  useEffect(() => { const t = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(t); }, []);

  const plan = day.plans[shift];
  const k = kpi(plan, day.execs, day.catalog);
  const novCount = day.novs.filter((n) => n.programacion_id === plan?.id).length;
  const unpub = ORDER.filter((x) => !day.plans[x] || day.plans[x].estado === "borrador").length;
  const eyebrow = format(clock, "EEEE dd·MM·yyyy · HH:mm", { locale: es }).toUpperCase();

  const turnoBadge = plan?.estado !== "borrador" && k.prog ? `${k.prog - k.pend}/${k.prog}` : "";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#edf2f1] text-[#1c2526] font-body">
      <Sidebar turnoBadge={turnoBadge} novBadge={novCount || ""} progBadge={unpub} />
      <main className="flex-1 min-w-0 px-4 md:px-8 pt-5 md:pt-7 pb-24 md:pb-10 flex flex-col gap-4 md:gap-5 bg-[linear-gradient(180deg,#dcecea_0,#edf2f1_260px)]">
        <div className="flex flex-col md:flex-row md:flex-wrap justify-between md:items-end gap-3 md:gap-3.5">
          <div>
            <div className="font-mono text-[11px] md:text-xs font-medium text-[#007f80] tracking-[.08em]">{eyebrow}</div>
            <h1 className="font-heading text-[26px] md:text-[34px] leading-[1.1] mt-1 md:mt-1.5">{TITLES[pathname] || "Programa APR"}</h1>
          </div>
          {!["/reportes", "/catalogo", "/usuarios"].includes(pathname) && <ShiftPills day={day} shift={shift} setShift={setShift} />}
        </div>
        <ViewAsSwitch />
        {readOnly && <div className="rounded-md bg-[#fbf3dc] text-[#7a5d0e] text-sm px-4 py-2.5">Modo solo lectura · Gerencia puede consultar todo, pero no modificar.</div>}
        {day.loading ? (
          <div className="py-24 grid place-items-center"><div className="w-7 h-7 border-[3px] border-[#cdd4d4] border-t-[#007f80] rounded-full animate-spin" /></div>
        ) : (
          <Outlet context={{ day, shift, plan, k, readOnly, canPlan }} />
        )}
      </main>
      <MobileNav turnoBadge={turnoBadge} novBadge={novCount || ""} progBadge={unpub} />
    </div>
  );
}