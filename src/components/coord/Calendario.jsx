import { useState } from "react";
import { addMonths, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import useLista from "@/hooks/useLista";
import { today } from "@/lib/apr";
import { btnP, btnS } from "@/lib/coord";
import CalendarioMes from "@/components/coord/CalendarioMes";
import EventoDialog from "@/components/coord/EventoDialog";
import AgendaListas from "@/components/coord/AgendaListas";

const fmt = (d) => format(d, "yyyy-MM-dd");

export default function Calendario({ user }) {
  const [mes, setMes] = useState(() => startOfMonth(new Date()));
  const ini = startOfWeek(mes, { weekStartsOn: 1 }), fin = endOfWeek(endOfMonth(mes), { weekStartsOn: 1 });
  const evs = useLista("EventoCoordinador", { created_by_id: user.id, fecha: { $gte: fmt(ini), $lte: fmt(fin) } }, { sort: "hora_inicio", limit: 500 });
  const [dlg, setDlg] = useState(null);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => setMes(addMonths(mes, -1))} className={btnS + " px-2"} aria-label="Mes anterior"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-heading text-2xl capitalize min-w-[170px] text-center">{format(mes, "MMMM yyyy", { locale: es })}</span>
          <button onClick={() => setMes(addMonths(mes, 1))} className={btnS + " px-2"} aria-label="Mes siguiente"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setMes(startOfMonth(new Date()))} className={btnS}>Hoy</button>
        </div>
        <button onClick={() => setDlg({ fecha: today() })} className={btnP}><Plus className="w-4 h-4" /> Nuevo evento</button>
      </div>
      <CalendarioMes ini={ini} fin={fin} mes={mes} eventos={evs.items} onAdd={(fecha) => setDlg({ fecha })} onOpen={(ev) => setDlg({ fecha: ev.fecha, ev })} />
      <AgendaListas user={user} onOpen={(ev) => setDlg({ fecha: ev.fecha, ev })} />
      {dlg && <EventoDialog {...dlg} eventos={evs.items.filter((e) => e.fecha === (dlg.ev?.fecha || dlg.fecha))} onClose={() => setDlg(null)} onSaved={evs.refresh} />}
    </div>
  );
}