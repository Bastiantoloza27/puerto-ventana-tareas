import { Link } from "react-router-dom";
import { card, SH } from "@/lib/apr";

export default function NotPublished({ shift }) {
  return (
    <div className={card + " p-6 md:p-10 flex flex-col items-center gap-3 text-center"}>
      <div className="font-heading text-2xl">La programación del {SH[shift].name} aún no se publica</div>
      <div className="text-sm text-[#6b7778] max-w-[460px]">Operaciones cambia cada día. Cuando llegue el correo con la programación del turno, la Jefatura la revisa y la publica para el asesor.</div>
      <Link to="/programacion" className="min-h-[44px] md:min-h-0 flex items-center px-[18px] py-3 md:py-2.5 rounded-md bg-[#007f80] hover:bg-[#005f60] text-white text-sm">Ir a programar</Link>
    </div>
  );
}