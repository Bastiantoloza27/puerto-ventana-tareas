import { SLOTS, fromMin, durLabel } from "@/lib/coord";

const sel = "min-h-[40px] rounded border border-[#cdd4d4] bg-[#f5f8fc] px-3 text-sm hover:border-[#16386a] focus:outline-none focus:border-[#16386a]";

// Inicio solo en horarios libres; el término se detiene en el próximo evento del día.
export default function HorasEvento({ ini, fin, libre, otros, onChange }) {
  const limite = otros.reduce((m, [s]) => (s > ini ? Math.min(m, s) : m), 1440);
  const fines = [...SLOTS, 1440].filter((v) => v > ini && v <= limite);
  const setIni = (v) => { const lim = otros.reduce((m, [s]) => (s > v ? Math.min(m, s) : m), 1440); onChange(v, fin > v && fin <= lim ? fin : Math.min(v + 60, lim)); };
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select aria-label="Inicio" value={ini} onChange={(e) => setIni(+e.target.value)} className={sel}>
        {SLOTS.filter((v) => libre(v) || v === ini).map((v) => <option key={v} value={v}>{fromMin(v)}</option>)}
      </select>
      <span aria-hidden="true">–</span>
      <select aria-label="Término" value={fin} onChange={(e) => onChange(ini, +e.target.value)} className={sel}>
        {fines.map((v) => <option key={v} value={v}>{fromMin(v % 1440)} ({durLabel(v - ini)})</option>)}
      </select>
    </div>
  );
}