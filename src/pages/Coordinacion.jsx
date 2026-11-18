import { useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import usePerfil from "@/hooks/usePerfil";
import MiDia from "@/components/coord/MiDia";
import Calendario from "@/components/coord/Calendario";
import TareasCoord from "@/components/coord/TareasCoord";
import ActasPanel from "@/components/coord/ActasPanel";
import DocumentosPanel from "@/components/coord/DocumentosPanel";
import TurnosAsesores from "@/components/coord/TurnosAsesores";
import AsignarTareas from "@/components/coord/AsignarTareas";

const COORD = [["dia", "Mi día"], ["cal", "Calendario"], ["tareas", "Tareas"], ["actas", "Reuniones y actas"], ["docs", "Documentos"], ["turnos", "Turnos asesores"]];

export default function Coordinacion() {
  const { user } = useAuth();
  const { isAdmin } = usePerfil();
  const { day } = useOutletContext();
  const tabs = [...(user?.coordinador || isAdmin ? COORD : []), ...(isAdmin ? [["jef", "Tareas a coordinadores"]] : [])];
  const [tab, setTab] = useState(tabs[0]?.[0]);
  if (!tabs.length) return <Navigate to="/" replace />;
  const actual = tabs.some(([k]) => k === tab) ? tab : tabs[0][0];
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="inline-flex p-1 rounded-lg bg-white border border-[#dde5e4] gap-0.5">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={"px-3.5 py-2 min-h-[40px] rounded-md text-sm font-medium whitespace-nowrap transition-colors " + (actual === k ? "bg-[#16386a] text-white" : "text-[#16386a] hover:bg-[#e3e9f1]")}>{l}</button>
          ))}
        </div>
      </div>
      <div key={actual} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
        {actual === "dia" && <MiDia user={user} day={day} go={setTab} />}
        {actual === "cal" && <Calendario user={user} />}
        {actual === "tareas" && <TareasCoord user={user} />}
        {actual === "actas" && <ActasPanel user={user} />}
        {actual === "docs" && <DocumentosPanel user={user} />}
        {actual === "turnos" && <div className="max-w-xl"><TurnosAsesores day={day} /></div>}
        {actual === "jef" && <AsignarTareas />}
      </div>
    </div>
  );
}