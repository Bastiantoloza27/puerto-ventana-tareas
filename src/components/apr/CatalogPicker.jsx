import { Checkbox } from "@/components/ui/checkbox";
import { card, TIPO_LABEL } from "@/lib/apr";

const TAG = { t: "bg-[#e2f4f4] text-[#005f60]", o: "bg-[#fbf3dc] text-[#7a5d0e]", c: "bg-[#eef1f1] text-[#5b6667]" };

export default function CatalogPicker({ catalog, ids, toggle, locked }) {
  const areas = [...new Set(catalog.map((c) => c.area))];
  return (
    <div className="flex flex-col gap-4">
      {areas.map((area) => {
        const list = catalog.filter((c) => c.area === area);
        const n = list.filter((c) => ids.includes(c.id)).length;
        return (
          <div key={area} className={card + " overflow-hidden"}>
            <div className="flex justify-between items-baseline px-4 py-3 border-b border-[#eef1f1]">
              <span className="text-[15px] font-semibold">{area}</span>
              <span className="font-mono text-xs text-[#6b7778]">{n}/{list.length}</span>
            </div>
            {list.map((c) => (
              <label key={c.id} className={"flex items-start gap-3 px-4 py-2.5 border-b border-[#eef1f1] last:border-0 transition-colors " + (locked ? "" : "cursor-pointer hover:bg-[#f4faf9]")}>
                <Checkbox checked={ids.includes(c.id)} disabled={locked} onCheckedChange={() => toggle(c.id)} className="mt-0.5 data-[state=checked]:bg-[#007f80] data-[state=checked]:border-[#007f80]" />
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{c.proceso}</span>
                  <span className="text-xs text-[#6b7778]"> · {c.sitio}</span>
                </span>
                <span className={"text-[11px] px-2 py-0.5 rounded-[10px] whitespace-nowrap " + TAG[c.tipo]}>{TIPO_LABEL[c.tipo]}</span>
              </label>
            ))}
          </div>
        );
      })}
    </div>
  );
}