import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { rango } from "@/lib/coord";

// Franja bajo la grilla: lista exactamente los puntos del día (sus actividades), en orden de inicio.
export default function MiniCalDetalle({ id, open, swapping, fecha, eventos, onClose }) {
  return (
    <div id={id} className="fgc3-detail" {...(open ? { "data-fgc3-open": "" } : {})} {...(swapping ? { "data-fgc3-swapping": "" } : {})}>
      <div className="fgc3-detail-clip">
        <div className="fgc3-detail-inner">
          <div className="fgc3-detail-head">
            <h3 className="fgc3-detail-title">{fecha ? format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es }) : ""}</h3>
            <button className="fgc3-detail-close" type="button" aria-label="Cerrar detalle del día" onClick={onClose}>
              <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2.5 2.5 11.5 11.5 M11.5 2.5 2.5 11.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="fgc3-detail-body"><div className="fgc3-detail-body-clip">
            <ul className="fgc3-detail-list">
              {eventos.length ? eventos.map((e) => (
                <li key={e.id} className="fgc3-detail-row">
                  <span className="fgc3-detail-dot" style={{ "--fgc3-swatch": `var(--fgc3-${e.tipo || "recordatorio"})` }} />
                  <span className="fgc3-detail-name" {...(e.estado === "completado" ? { "data-done": "" } : {})}>{e.titulo}{e.lugar ? ` · ${e.lugar}` : ""}</span>
                  <span className="fgc3-detail-time">{rango(e)}</span>
                </li>
              )) : <li><p className="fgc3-detail-empty">Sin actividades programadas.</p></li>}
            </ul>
          </div></div>
        </div>
      </div>
    </div>
  );
}