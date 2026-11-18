import { useState } from "react";
import { Mail, ExternalLink, Check } from "lucide-react";
import { format } from "date-fns";
import { card } from "@/lib/apr";
import { btnP, btnS } from "@/lib/coord";

const KEY = "coord_correo_revisado";

// Recordatorio informativo: no lee el correo, solo invita a revisarlo y registra cuándo se hizo.
export default function CorreoRecordatorio() {
  const [rev, setRev] = useState(() => localStorage.getItem(KEY));
  const horas = rev ? (Date.now() - new Date(rev).getTime()) / 36e5 : Infinity;
  const pendiente = horas > 2;
  const marcar = () => { const t = new Date().toISOString(); localStorage.setItem(KEY, t); setRev(t); };
  return (
    <div className={card + " p-4 flex flex-col gap-3 border-l-4 " + (pendiente ? "border-l-[#d9a826]" : "border-l-[#2e8b57]")}>
      <div className="flex items-center gap-2.5">
        <span className={"w-9 h-9 rounded-full grid place-items-center " + (pendiente ? "bg-[#fbf3dc] text-[#7a5d0e]" : "bg-[#e3f4ea] text-[#1f6b40]")}><Mail className="w-4 h-4" /></span>
        <div className="flex-1">
          <div className="font-medium text-sm">{pendiente ? "Revisa tus correos no leídos" : "Correo al día"}</div>
          <div className="text-xs text-[#5b6b80]">{rev ? `Última revisión: ${format(new Date(rev), "dd-MM HH:mm")}` : "Aún no registras una revisión hoy"}</div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <a href="https://outlook.office.com/mail/" target="_blank" rel="noreferrer" className={btnP + " flex-1"}><ExternalLink className="w-4 h-4" /> Abrir Outlook</a>
        <button onClick={marcar} className={btnS}><Check className="w-4 h-4" /> Ya revisé</button>
      </div>
    </div>
  );
}