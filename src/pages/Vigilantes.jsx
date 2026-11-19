import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { SH, ORDER } from "@/lib/apr";
import useVigilancia from "@/hooks/useVigilancia";
import VigMiTurno from "@/components/vig/VigMiTurno";
import VigSeguimiento from "@/components/vig/VigSeguimiento";
import VigProgramacion from "@/components/vig/VigProgramacion";

const seg = (on) => "px-4 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-colors " + (on ? "bg-[#16386a] text-white" : "text-[#16386a] hover:bg-[#e3e9f1]");

export default function Vigilantes() {
  const { day, shift, canPlan } = useOutletContext();
  const [vista, setVista] = useState("turno");
  const [fecha, setFecha] = useState(day.fecha);
  const [turno, setTurno] = useState(shift);
  const v = useVigilancia(fecha, turno);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {canPlan && (
          <div className="inline-flex p-1 rounded-lg bg-white border border-[#dde5e4]">
            <button onClick={() => setVista("turno")} className={seg(vista === "turno")}>Mi turno</button>
            <button onClick={() => setVista("prog")} className={seg(vista === "prog")}>Programación</button>
            <button onClick={() => setVista("seg")} className={seg(vista === "seg")}>Seguimiento</button>
          </div>
        )}
        <div className="flex gap-2 items-center flex-wrap">
          {canPlan && <input type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} className="min-h-[44px] rounded-md border border-[#cdd4d4] px-3 bg-white text-sm" />}
          <div className="inline-flex p-1 rounded-lg bg-white border border-[#dde5e4]">
            {ORDER.map((t) => <button key={t} onClick={() => setTurno(t)} className={seg(turno === t)}>{SH[t].name}</button>)}
          </div>
        </div>
      </div>
      {v.loading ? (
        <div className="py-24 grid place-items-center"><div className="w-7 h-7 border-[3px] border-[#cdd4d4] border-t-[#2a64b8] rounded-full animate-spin" /></div>
      ) : vista === "prog" && canPlan ? (
        <VigProgramacion v={v} fecha={fecha} turno={turno} />
      ) : vista === "seg" && canPlan ? (
        <VigSeguimiento v={v} fecha={fecha} turno={turno} />
      ) : (
        <VigMiTurno v={v} fecha={fecha} turno={turno} />
      )}
    </div>
  );
}