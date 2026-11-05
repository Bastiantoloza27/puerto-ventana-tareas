import usePerfil, { VIEW_KEY } from "@/hooks/usePerfil";

const OPTS = [["jefatura", "Jefatura"], ["asesor", "Asesor"]];

export default function ViewAsSwitch() {
  const { realAdmin, perfil } = usePerfil();
  if (!realAdmin) return null;
  const set = (v) => { localStorage.setItem(VIEW_KEY, v); window.location.reload(); };
  return (
    <div className="flex items-center gap-2 flex-wrap rounded-md bg-[#0f2340] text-[#e6efee] text-xs px-3 py-2">
      <span className="text-[#8fb0af]">Ver como:</span>
      {OPTS.map(([v, l]) => (
        <button key={v} onClick={() => set(v)} className={"px-2.5 py-1.5 rounded-md " + (perfil === v ? "bg-[#2a64b8] text-white" : "bg-[#1c3d68] text-[#a9c1c0]")}>{l}</button>
      ))}
      {perfil !== "jefatura" && <span className="text-[#e3c77a]">Vista de prueba</span>}
    </div>
  );
}