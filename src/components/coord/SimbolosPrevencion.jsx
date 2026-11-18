import { motion } from "framer-motion";
import { HardHat, ShieldCheck, TriangleAlert, LifeBuoy, TrafficCone, FireExtinguisher } from "lucide-react";

// Símbolos de prevención flotando sobre el mar del banner. En móvil se muestran menos y más tenues.
const ICONOS = [
  { Icon: ShieldCheck, pos: "right-[6%] top-[14%]", size: "w-14 h-14", d: 0 },
  { Icon: HardHat, pos: "right-[22%] top-[10%]", size: "w-10 h-10", d: 0.6, desk: true },
  { Icon: TriangleAlert, pos: "right-[15%] top-[48%]", size: "w-9 h-9", d: 1.2 },
  { Icon: LifeBuoy, pos: "right-[30%] top-[46%]", size: "w-8 h-8", d: 1.8, desk: true },
  { Icon: TrafficCone, pos: "right-[38%] top-[16%]", size: "w-8 h-8", d: 2.4, desk: true },
  { Icon: FireExtinguisher, pos: "right-[3%] top-[56%]", size: "w-8 h-8", d: 3, desk: true },
];

export default function SimbolosPrevencion() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {ICONOS.map(({ Icon, pos, size, d, desk }, i) => (
        <motion.div key={i} className={"absolute " + pos + (desk ? " hidden lg:block" : "")}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: [0.18, 0.4, 0.18], y: [0, -8, 0], rotate: [0, i % 2 ? 6 : -6, 0] }}
          transition={{ duration: 5 + i * 0.5, delay: d, repeat: Infinity, ease: "easeInOut" }}>
          <Icon className={size + " text-white"} strokeWidth={1.4} />
        </motion.div>
      ))}
    </div>
  );
}