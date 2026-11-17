import { useEffect, useState } from "react";
import { Users } from "lucide-react";

// Personas presentes durante la actividad: automática si viene de la nombrada, manual en el resto.
export default function PersonasInput({ value, dot, editable, onSave }) {
  const [v, setV] = useState(value ?? "");
  useEffect(() => setV(value ?? ""), [value]);
  if (dot != null) return (
    <span title="Dotación según la nombrada" className="flex items-center gap-1.5 text-xs text-[#16386a] bg-[#e4ecf8] rounded-md px-2.5 py-1.5">
      <Users className="w-3.5 h-3.5" /><b className="font-mono">{dot}</b> personas · nombrada
    </span>
  );
  const save = () => {
    const n = v === "" ? null : Math.max(0, Math.round(Number(v)));
    if (n !== (value ?? null)) onSave(n);
  };
  return (
    <label className="flex items-center gap-1.5 text-xs text-[#5b6667]">
      <Users className="w-3.5 h-3.5" />
      <input type="number" min="0" inputMode="numeric" value={v} disabled={!editable} onChange={(e) => setV(e.target.value)} onBlur={save}
        placeholder="—" className="w-16 text-base md:text-[13px] font-mono px-2 py-1.5 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#2a64b8] disabled:bg-[#f4f6f6]" />
      personas
    </label>
  );
}