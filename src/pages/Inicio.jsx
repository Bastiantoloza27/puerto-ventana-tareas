import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ORDER, SH, kpi } from "@/lib/apr";
import HeroSaludo from "@/components/inicio/HeroSaludo";
import StatCard from "@/components/inicio/StatCard";
import TurnosHoy from "@/components/inicio/TurnosHoy";
import HacerAhora from "@/components/inicio/HacerAhora";
import MinimosResumen from "@/components/inicio/MinimosResumen";
import IndiceUv from "@/components/inicio/IndiceUv";

export default function Inicio() {
  const { day, canPlan } = useOutletContext();
  const { user } = useAuth();
  const mes = day.fecha.slice(0, 7);
  const { data: cerrados = [] } = useQuery({ queryKey: ["mesCerrados", mes], queryFn: async () => (await base44.entities.Programacion.filter({ estado: "cerrada", fecha: { $gte: mes + "-01", $lte: mes + "-31" } }, { limit: 200 })).items });
  const mesPct = cerrados.length ? Math.round(cerrados.reduce((s, p) => s + (p.r_pct || 0), 0) / cerrados.length) : 0;

  const ks = ORDER.map((t) => ({ t, p: day.plans[t], k: kpi(day.plans[t], day.execs, day.catalog) }));
  const pub = ks.filter((x) => x.p && x.p.estado !== "borrador");
  const prog = pub.reduce((s, x) => s + x.k.prog, 0);
  const reg = pub.reduce((s, x) => s + x.k.prog - x.k.pend, 0);
  const curso = pub.find((x) => x.p.estado === "publicada");
  const sinProg = ks.filter((x) => !x.p || x.p.estado === "borrador");
  const mine = canPlan ? null : user?.full_name;

  const todo = [
    ...pub.filter((x) => x.k.pend && x.p.estado === "publicada").map((x) => ({ text: `${SH[x.t].name}: ${x.k.pend} actividad(es) por registrar`, to: "/turno", warn: true })),
    ...(canPlan ? sinProg.map((x) => ({ text: `Programar el ${SH[x.t].name} (${SH[x.t].hours})`, to: "/programacion" })) : []),
  ];
  const resumen = [curso && `${SH[curso.t].name} en curso con ${curso.p.asesor}`, prog && `${reg} de ${prog} actividades registradas`, sinProg.length && `${sinProg.map((x) => SH[x.t].name).join(", ")} sin programar`].filter(Boolean).join(" · ") || "Aún no hay turnos programados hoy";

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <HeroSaludo resumen={resumen} cta={{ to: "/turno", label: "Ver mi turno →" }} cta2={canPlan && sinProg[0] ? { to: "/programacion", label: `Programar ${SH[sinProg[0].t].name}` } : null} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Actividades del día" value={prog} note={`${reg} registradas`} />
        <StatCard label="Cumplimiento hoy" value={curso ? curso.k.pct : pub[0]?.k.pct || 0} suffix="%" note={curso ? "turno en curso" : "último turno"} />
        <StatCard label="Novedades hoy" value={day.novs.length} note="en todos los turnos" />
        <StatCard label="Cumplimiento del mes" value={mesPct} suffix="%" note={`${cerrados.length} turnos cerrados`} />
      </div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <TurnosHoy day={day} />
        <div className="flex flex-col gap-4"><IndiceUv /><HacerAhora items={todo} /><MinimosResumen mes={mes} asesor={mine} /></div>
      </div>
    </div>
  );
}