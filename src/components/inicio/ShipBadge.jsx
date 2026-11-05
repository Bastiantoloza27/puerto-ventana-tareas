import { motion } from "framer-motion";

// Barco pequeño en la esquina inferior del banner, navega suavemente de lado a lado.
export default function ShipBadge({ onClick }) {
  return (
    <motion.button type="button" onClick={onClick} aria-label="Barco" className="absolute bottom-3 right-6 md:right-10 w-20 md:w-24" animate={{ x: [0, -40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}>
      <motion.svg viewBox="0 0 180 70" className="w-full h-auto" animate={{ y: [0, 2, 0], rotate: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <g fill="#ffffff" fillOpacity="0.35">
          {[0, 1, 2, 3, 4, 5].map((c) => [0, 1].map((r) => <rect key={c + "-" + r} x={22 + c * 17} y={36 - r * 9} width="15" height="8" rx="1" />))}
        </g>
        <path d="M126 16 h22 v26 h-22 Z M132 8 h8 v8 h-8 Z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M4 45 H170 L160 64 H22 Q10 58 4 45 Z" fill="#ffffff" fillOpacity="0.8" />
        <rect x="4" y="45" width="166" height="2.5" fill="#b9574a" />
      </motion.svg>
    </motion.button>
  );
}