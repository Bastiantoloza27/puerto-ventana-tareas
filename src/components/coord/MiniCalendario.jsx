import { useEffect, useRef, useState } from "react";
import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, getDay, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useLista from "@/hooks/useLista";
import { TIPOS } from "@/lib/coord";
import MiniCalDetalle from "@/components/coord/MiniCalDetalle";
import "@/components/coord/miniCal.css";

const DN = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const fmt = (d) => format(d, "yyyy-MM-dd");
const ORDEN = TIPOS.map((t) => t[0]);

export default function MiniCalendario({ user }) {
  const [modo, setModo] = useState("semana");
  const [ref, setRef] = useState(() => new Date());
  const [focus, setFocus] = useState(null);
  const [sel, setSel] = useState(null);
  const [shown, setShown] = useState(null);
  const [swapping, setSwapping] = useState(false);
  const [enter, setEnter] = useState(true);
  const timer = useRef(null);
  const secRef = useRef(null);
  const ini = modo === "mes" ? startOfMonth(ref) : startOfWeek(ref, { weekStartsOn: 1 });
  const fin = modo === "mes" ? endOfMonth(ref) : endOfWeek(ref, { weekStartsOn: 1 });
  const evs = useLista("EventoCoordinador", { created_by_id: user.id, fecha: { $gte: fmt(ini), $lte: fmt(fin) } }, { sort: "hora_inicio", limit: 500 });
  useEffect(() => { const t = setTimeout(() => setEnter(false), 1400); return () => clearTimeout(t); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const dias = eachDayOfInterval({ start: ini, end: fin });
  const lead = modo === "mes" ? (getDay(ini) + 6) % 7 : 0;
  const trail = (7 - ((lead + dias.length) % 7)) % 7;
  const hoyVisible = dias.some((d) => isToday(d));
  const hoyCol = (getDay(new Date()) + 6) % 7;
  const delDia = (f) => evs.items.filter((e) => e.fecha === f);

  const cerrar = () => { clearTimeout(timer.current); setSwapping(false); const prev = sel; setSel(null); if (prev) secRef.current?.querySelector(`[data-fgc3-date="${prev}"]`)?.focus(); };
  const abrir = (f) => {
    clearTimeout(timer.current);
    if (sel === f) return cerrar();
    if (sel) { setSel(f); setSwapping(true); timer.current = setTimeout(() => { setShown(f); setSwapping(false); }, 180); }
    else { setSel(f); setShown(f); setSwapping(false); }
  };
  const mover = (n) => { cerrar(); setRef(modo === "mes" ? addMonths(ref, n) : addWeeks(ref, n)); };
  const cambiarModo = (m) => { cerrar(); setModo(m); setRef(new Date()); };
  const titulo = modo === "mes" ? format(ref, "MMMM yyyy", { locale: es }) : `Semana del ${format(ini, "d MMM", { locale: es })}`;

  return (
    <section ref={secRef} className="fgc3-section" data-fgc3-modo={modo} {...(enter ? { "data-fgc3-enter": "" } : {})} onKeyDown={(e) => e.key === "Escape" && sel && cerrar()}>
      <div className="fgc3-stage">
        <header>
          <div className="fgc3-head">
            <h2 className="fgc3-title">{titulo}</h2>
            <div className="fgc3-ctrl">
              <button type="button" className="fgc3-arrow" aria-label="Anterior" onClick={() => mover(-1)}><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" className="fgc3-arrow" aria-label="Siguiente" onClick={() => mover(1)}><ChevronRight className="w-4 h-4" /></button>
              <div className="fgc3-seg">{[["semana", "Semana"], ["mes", "Mes"]].map(([k, l]) => <button key={k} type="button" aria-pressed={modo === k} onClick={() => cambiarModo(k)}>{l}</button>)}</div>
            </div>
          </div>
          <ul className="fgc3-legend">
            {TIPOS.map(([k, l]) => (
              <li key={k}><button type="button" className="fgc3-legend-btn" aria-pressed={focus === k} {...(focus && focus !== k ? { "data-fgc3-dim": "" } : {})} style={{ "--fgc3-swatch": `var(--fgc3-${k})` }} onClick={() => setFocus(focus === k ? null : k)}><span className="fgc3-legend-swatch" />{l}</button></li>
            ))}
          </ul>
        </header>
        <div className="fgc3-card">
          <div className="fgc3-weekdays" aria-hidden="true">
            {DN.map((d, i) => <span key={d} className="fgc3-weekday" {...(hoyVisible && i === hoyCol ? { "data-fgc3-today": "" } : {})}>{d}</span>)}
          </div>
          <div className="fgc3-month">
            <div className="fgc3-grid" role="group" aria-label={titulo} {...(focus ? { "data-fgc3-focus": focus } : {})}>
              {Array.from({ length: lead }, (_, i) => <span key={"l" + i} className="fgc3-day fgc3-day--empty" aria-hidden="true" />)}
              {dias.map((d) => {
                const f = fmt(d);
                const lista = delDia(f);
                const dots = lista.map((e) => e.tipo || "recordatorio");
                // El relleno es énfasis: el tipo que predomina en el día. No se cuenta como actividad.
                const fill = dots.length ? [...ORDEN].sort((a, b) => dots.filter((x) => x === b).length - dots.filter((x) => x === a).length)[0] : null;
                const has = [...new Set([fill, ...dots].filter(Boolean))];
                return (
                  <button key={f} type="button" className="fgc3-day" data-fgc3-date={f} aria-expanded={sel === f} aria-controls="fgc3-mini-detalle"
                    {...(fill ? { "data-fgc3-fill": fill, style: { "--fgc3-fill": `var(--fgc3-${fill})` } } : {})}
                    {...(has.length ? { "data-fgc3-has": has.join(" ") } : {})}
                    {...(isToday(d) ? { "aria-current": "date" } : {})}
                    aria-label={`${format(d, "d 'de' MMMM", { locale: es })}: ${lista.length ? lista.map((e) => e.titulo).join(", ") : "sin actividades"}`}
                    onClick={() => abrir(f)}>
                    <span className="fgc3-bubble"><span className="fgc3-num" style={!isSameMonth(d, ref) && modo === "semana" ? { color: "var(--fgc3-muted)" } : undefined}>{format(d, "d")}</span></span>
                    <span className="fgc3-dots">{dots.map((t, i) => <span key={i} className="fgc3-dot" style={{ "--fgc3-swatch": `var(--fgc3-${t})` }} />)}</span>
                    {modo === "semana" && (
                      <span className="fgc3-wk-list">
                        {lista.slice(0, 4).map((e) => (
                          <span key={e.id} className="fgc3-wk-chip" style={{ "--fgc3-swatch": `var(--fgc3-${e.tipo || "recordatorio"})` }} {...(e.estado === "completado" ? { "data-done": "" } : {})}>
                            {e.hora_inicio && <span className="fgc3-wk-time">{e.hora_inicio}</span>}{e.titulo}
                          </span>
                        ))}
                        {lista.length > 4 && <span className="fgc3-wk-more">+{lista.length - 4} más</span>}
                        {!lista.length && <span className="fgc3-wk-empty">Libre</span>}
                      </span>
                    )}
                  </button>
                );
              })}
              {Array.from({ length: trail }, (_, i) => <span key={"t" + i} className="fgc3-day fgc3-day--empty" aria-hidden="true" />)}
            </div>
            <MiniCalDetalle id="fgc3-mini-detalle" open={!!sel} swapping={swapping} fecha={shown} eventos={shown ? delDia(shown) : []} onClose={cerrar} />
          </div>
        </div>
      </div>
    </section>
  );
}