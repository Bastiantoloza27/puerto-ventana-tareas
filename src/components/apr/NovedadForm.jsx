import { useState } from "react";
import { Loader2 } from "lucide-react";
import { card, chipCls, LUG, TIPOS, CRIT, NOMB } from "@/lib/apr";
import EvidenceList from "@/components/apr/EvidenceList";

const empty = { lugar: "Sitio 5", tipo: null, criticidad: "Media", descripcion: "", quien: [], otro: "", accion: "", evidencias: [] };
const inputCls = "w-full text-base md:text-[13px] px-3 py-2.5 md:py-2 rounded-md border border-[#cdd4d4] bg-white focus:outline-none focus:border-[#007f80]";

export default function NovedadForm({ shift, asesor, onSave }) {
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (p) => setF((s) => ({ ...s, ...p }));
  const nb = NOMB[f.lugar];
  const sugg = nb ? [nb.jefe, ...nb.c] : [];
  const tog = (q) => set({ quien: f.quien.includes(q) ? f.quien.filter((x) => x !== q) : [...f.quien, q] });

  const submit = async () => {
    if (!f.tipo || !f.descripcion.trim()) return setErr("Indica el tipo y describe la novedad.");
    setBusy(true); setErr("");
    const quien = [f.quien.join(", "), f.otro.trim(), asesor ? "Asesor " + asesor : ""].filter(Boolean).join(" · ");
    await onSave({ lugar: f.lugar, tipo: f.tipo, criticidad: f.criticidad, descripcion: f.descripcion.trim(), quien, accion: f.accion.trim(), evidencias: f.evidencias });
    setF(empty); setBusy(false);
  };

  return (
    <div className={card + " p-4 flex flex-col gap-3.5"}>
      <div className="font-heading text-xl">Registrar novedad</div>
      <div className="flex flex-col gap-1.5"><span className="text-xs text-[#6b7778]">Lugar</span><div className="flex gap-1.5 flex-wrap">{LUG.map((l) => <button key={l} onClick={() => set({ lugar: l, quien: [] })} className={chipCls(f.lugar === l)}>{l}</button>)}</div></div>
      <div className="flex flex-col gap-1.5"><span className="text-xs text-[#6b7778]">Tipo</span><div className="flex gap-1.5 flex-wrap">{TIPOS.map((t) => <button key={t} onClick={() => set({ tipo: t })} className={chipCls(f.tipo === t)}>{t}</button>)}</div></div>
      <div className="flex flex-col gap-1.5"><span className="text-xs text-[#6b7778]">Criticidad</span><div className="flex gap-1.5">{Object.entries(CRIT).map(([c, [bg, fg]]) => (
        <button key={c} onClick={() => set({ criticidad: c })} className="text-[13px] px-3 py-1.5 rounded-[14px] border transition-colors" style={f.criticidad === c ? { background: fg, borderColor: fg, color: "#fff" } : { background: bg, borderColor: bg, color: fg }}>{c}</button>))}</div></div>
      <textarea rows={3} value={f.descripcion} onChange={(e) => set({ descripcion: e.target.value })} placeholder="¿Qué pasó?" className={inputCls} />
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-[#6b7778]">Quién estuvo {nb && <>· sugerido desde la nombrada: {nb.f} ({nb.n[shift]} personas)</>}</span>
        {sugg.length > 0 && <div className="flex gap-1.5 flex-wrap">{sugg.map((q) => <button key={q} onClick={() => tog(q)} className={chipCls(f.quien.includes(q)) + " font-mono !text-xs"}>{q}</button>)}</div>}
        <input value={f.otro} onChange={(e) => set({ otro: e.target.value })} placeholder="Otros (texto libre)" className={inputCls} />
      </div>
      <input value={f.accion} onChange={(e) => set({ accion: e.target.value })} placeholder="Acción inmediata" className={inputCls} />
      <EvidenceList items={f.evidencias} editable onAdd={(x) => set({ evidencias: [...f.evidencias, ...x] })} onRemove={(i) => set({ evidencias: f.evidencias.filter((_, j) => j !== i) })} />
      {err && <div className="text-xs text-[#9b3b2e] bg-[#f6e4e0] rounded-md px-3 py-2">{err}</div>}
      <button onClick={submit} disabled={busy} className="self-stretch md:self-start px-[18px] py-3 md:py-2.5 min-h-[44px] md:min-h-0 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm flex items-center justify-center md:justify-start gap-2">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Registrar novedad</button>
    </div>
  );
}