import { NavLink } from "react-router-dom";
import { ClipboardCheck, AlertTriangle, CalendarDays, ListChecks, BarChart3 } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Mi turno", Icon: ClipboardCheck, badge: "turno" },
  { to: "/cierre", label: "Cierre", Icon: AlertTriangle, badge: "nov" },
  { to: "/programacion", label: "Programar", Icon: CalendarDays, badge: "prog" },
  { to: "/catalogo", label: "Catálogo", Icon: ListChecks },
  { to: "/reportes", label: "Reportes", Icon: BarChart3 },
];

export default function MobileNav({ turnoBadge, novBadge, progBadge }) {
  const badges = { turno: turnoBadge, nov: novBadge, prog: progBadge };
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0e2a2b] border-t border-[#1f4344] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {ITEMS.map(({ to, label, Icon, badge }) => (
          <NavLink key={to} to={to} end className="relative">
            {({ isActive }) => (
              <span className={"flex flex-col items-center justify-center gap-1 min-h-[58px] pt-2 pb-1.5 text-[10px] font-medium transition-colors " + (isActive ? "text-white" : "text-[#8fb0af]")}>
                {isActive && <span className="absolute top-0 left-3 right-3 h-[3px] rounded-b bg-[#00abac]" />}
                <Icon className="w-[21px] h-[21px]" />
                <span>{label}</span>
                {badges[badge] ? (
                  <span className="absolute top-1.5 left-[calc(50%+9px)] min-w-[16px] h-4 px-1 rounded-full bg-[#e3c77a] text-[#0e2a2b] font-mono text-[9px] leading-4 grid place-items-center">{badges[badge]}</span>
                ) : null}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}