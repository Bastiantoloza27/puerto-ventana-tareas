import { motion } from "framer-motion";

// Escena animada del puerto: olas, barco navegando y grúa. Al hacer clic, el barco hace sonar la bocina (ondas).
export default function PortScene({ night, onShip }) {
  const wave = (d, o, dur) => (
    <motion.path d={d} fill="#ffffff" fillOpacity={o} animate={{ x: [0, -120, 0] }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }} />
  );
  return (
    <svg viewBox="0 0 600 180" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {night ? [40, 120, 210, 330, 470, 540].map((x, i) => (
        <motion.circle key={x} cx={x} cy={20 + (i % 3) * 18} r="1.4" fill="#fff" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2 + i * 0.4, repeat: Infinity }} />
      )) : null}
      <motion.circle cx="520" cy="46" r="18" fill={night ? "#e8eefc" : "#ffd27a"} fillOpacity={0.85} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity }} />
      <g fill="#ffffff" fillOpacity="0.18">
        <rect x="430" y="70" width="6" height="70" /><rect x="400" y="70" width="80" height="5" />
        <motion.rect x="460" y="75" width="2" height="30" animate={{ height: [30, 48, 30] }} transition={{ duration: 3.5, repeat: Infinity }} />
      </g>
      <g pointerEvents="none">
      {wave("M0 150 Q75 138 150 150 T300 150 T450 150 T600 150 T750 150 V180 H0Z", 0.12, 7)}
      {wave("M0 160 Q75 150 150 160 T300 160 T450 160 T600 160 T750 160 V180 H0Z", 0.2, 5)}
      </g>
    </svg>
  );
}