import { TIPOS, tipoLabel } from "@/lib/coord";

export default function TipoSwatches({ value, onChange }) {
  return (
    <fieldset className="mt-6 flex items-center gap-2.5 flex-wrap">
      <legend className="sr-only">Tipo de evento</legend>
      {TIPOS.map(([k, l, cls]) => (
        <label key={k} title={l} className={"relative w-[26px] h-[26px] rounded-full cursor-pointer shadow-[inset_0_0_0_1px_rgba(22,56,106,.15)] " + cls + (value === k ? " ring-2 ring-offset-2 ring-[#16386a]" : "")}>
          <input type="radio" name="tipo" value={k} checked={value === k} onChange={() => onChange(k)} className="absolute inset-0 opacity-0 cursor-pointer" />
          <span className="sr-only">{l}</span>
        </label>
      ))}
      <span className="text-xs text-[#5b6b80] ml-1">{tipoLabel(value)}</span>
    </fieldset>
  );
}