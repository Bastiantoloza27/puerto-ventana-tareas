import { useState } from "react";
import { Plus, Search } from "lucide-react";
import useLista from "@/hooks/useLista";
import { card } from "@/lib/apr";
import { inp, btnP } from "@/lib/coord";
import ActaCard from "@/components/coord/ActaCard";
import ActaForm from "@/components/coord/ActaForm";

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function ActasPanel({ user }) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null);
  const actas = useLista("ActaReunion", { created_by_id: user.id, ...(q.trim() ? { titulo: { $regex: escRe(q.trim()), $options: "i" } } : {}) }, { sort: "-fecha", limit: 100 });
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="w-4 h-4 absolute left-3 top-3 text-[#6b7778]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar acta por tema" className={inp + " pl-9"} /></div>
        <button onClick={() => setForm({})} className={btnP}><Plus className="w-4 h-4" /> Nueva acta</button>
      </div>
      {!actas.loading && !actas.items.length && <div className={card + " p-5 text-sm text-[#6b7778]"}>{q ? "No hay actas con ese tema." : "Aún no registras actas de reunión."}</div>}
      {actas.items.map((a) => <ActaCard key={a.id} a={a} onEdit={setForm} onSaved={actas.refresh} />)}
      {form && <ActaForm acta={form.id ? form : null} onClose={() => setForm(null)} onSaved={actas.refresh} />}
    </div>
  );
}