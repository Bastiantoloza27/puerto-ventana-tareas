import { Link } from "react-router-dom";
import { card } from "@/lib/apr";

export default function HacerAhora({ items }) {
  return (
    <div className={card + " p-4 flex flex-col gap-1"}>
      <span className="font-heading text-xl pb-2">Para hacer ahora</span>
      {!items.length && <span className="text-sm text-[#6b7778]">Todo al día. ¡Buen trabajo!</span>}
      {items.map((i) => (
        <Link key={i.text} to={i.to} className="flex items-center gap-2.5 py-2 text-sm hover:text-[#2a64b8]">
          <span className={"w-2 h-2 rounded-full flex-none " + (i.warn ? "bg-[#c49a1c]" : "bg-[#2a64b8]")} />
          <span className="flex-1">{i.text}</span><span className="text-[#2a64b8]">→</span>
        </Link>
      ))}
    </div>
  );
}