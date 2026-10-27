import { NavLink } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LOGO } from "@/lib/apr";
import SecurityBadges from "@/components/apr/SecurityBadges";

const Label = ({ children }) => <div className="font-mono text-[10px] font-medium tracking-[.14em] text-[#6f9493] px-2.5 pt-3.5 pb-1">{children}</div>;

function Item({ to, label, badge, amber }) {
  return (
    <NavLink to={to} end className={({ isActive }) => "flex justify-between items-center px-2.5 py-[9px] rounded-md text-sm font-medium transition-colors " + (isActive ? "bg-[#1b4a4a] text-white" : "text-[#a9c1c0] hover:text-white")}>
      <span>{label}</span>
      {badge != null && badge !== "" && (amber
        ? <span className="font-mono text-[11px] px-[7px] py-px rounded-[9px] bg-[#e3c77a] text-[#0e2a2b]">{badge}</span>
        : <span className="font-mono text-[11px] text-[#7fd6d6]">{badge}</span>)}
    </NavLink>
  );
}

export default function Sidebar({ turnoBadge, novBadge, progBadge }) {
  const { user } = useAuth();
  const ini = (user?.full_name || "Jefatura Prevención").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <aside className="hidden md:flex md:w-[232px] md:flex-none bg-[#0e2a2b] text-[#e6efee] px-4 py-6 flex-col gap-1 md:sticky md:top-0 md:h-screen overflow-auto">
      <div className="flex flex-col gap-3 px-2 pb-[22px] mb-2.5 border-b border-[#1f4344]">
        <img src={LOGO} alt="PVSA Puerto Ventanas S.A." className="h-[42px] w-auto self-start" />
        <div className="text-[13px] leading-tight"><div className="font-semibold text-white">Programa APR</div><div className="text-[#8fb0af] text-xs">Actividades prevencionistas por turno</div></div>
      </div>
      <Label>TURNO</Label>
      <Item to="/" label="Mi turno" badge={turnoBadge} />
      <Item to="/cierre" label="Novedades y cierre" badge={novBadge} />
      <Label>PLANIFICACIÓN</Label>
      <Item to="/programacion" label="Programación" badge={progBadge || null} amber />
      <Item to="/catalogo" label="Catálogo de actividades" />
      <Label>TRAZABILIDAD</Label>
      <Item to="/reportes" label="Reportes" />
      {user?.role === "admin" && <><Label>ADMINISTRACIÓN</Label><Item to="/usuarios" label="Usuarios y perfiles" /></>}
      <div className="mt-auto px-2.5 pb-3"><SecurityBadges compact /></div>
      <div className="pt-3.5 px-2.5 border-t border-[#1f4344] text-xs text-[#8fb0af] leading-snug flex gap-2.5 items-center">
        <span className="w-8 h-8 rounded-full bg-[#1b4a4a] text-[#7fd6d6] grid place-items-center font-mono text-xs font-medium flex-none">{ini}</span>
        <span><span className="text-[#e6efee] block">{user?.full_name || "Jefatura de Prevención"}</span>{user?.role === "admin" ? "Jefatura" : user?.perfil === "gerencia" ? "Gerencia · solo lectura" : "Asesor"}</span>
      </div>
    </aside>
  );
}