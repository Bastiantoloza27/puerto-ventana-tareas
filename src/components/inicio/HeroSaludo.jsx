import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PortScene from "@/components/inicio/PortScene";

const FRASES = ["¡Buen turno, equipo!", "La seguridad la hacemos todos.", "Cero accidentes, todos los días.", "Prevenir es cuidarnos."];

export default function HeroSaludo({ resumen, cta, cta2 }) {
  const h = new Date().getHours();
  const saludo = h < 12 && h >= 6 ? "Buenos días" : h < 20 && h >= 12 ? "Buenas tardes" : "Buenas noches";
  const [frase, setFrase] = useState(null);
  const onShip = () => { setFrase(FRASES[Math.floor(Math.random() * FRASES.length)]); setTimeout(() => setFrase(null), 2600); };
  return (
    <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(115deg,#0f2340_0%,#16386a_55%,#2a64b8_100%)] text-white min-h-[190px] px-6 md:px-8 py-6 md:py-7 shadow-[0_10px_30px_rgba(15,35,64,.25)]">
      <PortScene night={h >= 20 || h < 6} onShip={onShip} />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="font-mono text-[11px] tracking-[.14em] text-[#9cc0f0]">RESUMEN DEL DÍA</div>
          <h2 className="font-heading text-[28px] md:text-[34px] leading-tight mt-1">{saludo}, equipo de Prevención</h2>
          <p className="text-sm text-[#d6e2f5] mt-1.5">{resumen}</p>
          <p className="text-[11px] text-[#9cc0f0] mt-2">Toca el barco 🚢</p>
        </motion.div>
        <div className="flex gap-2.5 flex-wrap">
          {cta && <Link to={cta.to} className="px-4 py-2.5 rounded-md bg-white text-[#0f2340] text-sm font-medium hover:bg-[#e4ecf8]">{cta.label}</Link>}
          {cta2 && <Link to={cta2.to} className="px-4 py-2.5 rounded-md border border-white/50 text-white text-sm font-medium hover:bg-white/10">{cta2.label}</Link>}
        </div>
      </div>
      <AnimatePresence>
        {frase && <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white text-[#0f2340] text-sm font-medium shadow-lg">{frase}</motion.div>}
      </AnimatePresence>
    </div>
  );
}