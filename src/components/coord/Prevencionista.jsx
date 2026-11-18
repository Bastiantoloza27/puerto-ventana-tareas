import "@/components/coord/prevencionista.css";

// Prevencionista ilustrado: casco, chaleco reflectante y lista de chequeo que se va marcando.
export default function Prevencionista({ className = "" }) {
  return (
    <svg viewBox="0 0 200 220" className={className} role="img" aria-label="Prevencionista con casco y lista de chequeo">
      <ellipse className="prev-shadow" cx="100" cy="208" rx="52" ry="7" fill="#0a1830" />
      <path d="M150 196 l14 -46 l14 46 z" fill="#f08a2c" /><rect x="146" y="192" width="36" height="6" rx="2" fill="#d9701a" />
      <rect x="156" y="166" width="16" height="5" fill="#fff" opacity=".9" /><rect x="153" y="178" width="22" height="5" fill="#fff" opacity=".9" />
      <g className="prev-body">
        <rect x="72" y="150" width="20" height="50" rx="8" fill="#1d3b63" /><rect x="102" y="150" width="20" height="50" rx="8" fill="#1d3b63" />
        <rect x="68" y="194" width="28" height="10" rx="5" fill="#2b2b2b" /><rect x="100" y="194" width="28" height="10" rx="5" fill="#2b2b2b" />
        <path d="M64 108 q0 -16 16 -18 h34 q16 2 16 18 v50 h-66 z" fill="#2a64b8" />
        <path d="M66 108 q0 -14 14 -16 h12 l5 66 h-31 z" fill="#f2a33a" /><path d="M128 108 q0 -14 -14 -16 h-12 l-5 66 h31 z" fill="#f2a33a" />
        <rect className="prev-stripe" x="66" y="128" width="28" height="5" fill="#f5f7fa" /><rect className="prev-stripe" x="100" y="128" width="28" height="5" fill="#f5f7fa" />
        <rect className="prev-stripe" x="66" y="142" width="28" height="5" fill="#f5f7fa" /><rect className="prev-stripe" x="100" y="142" width="28" height="5" fill="#f5f7fa" />
        <rect x="74" y="100" width="14" height="8" rx="2" fill="#fff" opacity=".85" />
        <rect x="88" y="78" width="18" height="14" rx="4" fill="#e9b48c" />
        <circle cx="97" cy="60" r="22" fill="#f1c39c" />
        <ellipse className="prev-eye" cx="89" cy="60" rx="2.4" ry="3" fill="#1c2526" /><ellipse className="prev-eye" cx="105" cy="60" rx="2.4" ry="3" fill="#1c2526" />
        <path d="M90 70 q7 6 14 0" stroke="#1c2526" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="84" cy="67" r="3" fill="#f2a08a" opacity=".5" /><circle cx="110" cy="67" r="3" fill="#f2a08a" opacity=".5" />
        <path d="M72 52 q0 -26 25 -27 q25 1 25 27 z" fill="#f7c948" /><rect x="66" y="49" width="62" height="7" rx="3.5" fill="#e8b52e" />
        <rect x="93" y="27" width="8" height="24" rx="4" fill="#ffd966" />
        <g className="prev-arm"><path d="M128 100 q14 -6 20 -28" stroke="#2a64b8" strokeWidth="13" strokeLinecap="round" fill="none" /><circle cx="149" cy="68" r="8" fill="#f1c39c" /></g>
        <path d="M68 104 q-14 12 -8 30" stroke="#2a64b8" strokeWidth="13" strokeLinecap="round" fill="none" />
        <g transform="rotate(-8 52 132)">
          <rect x="32" y="108" width="42" height="54" rx="4" fill="#8a5a2b" /><rect x="36" y="114" width="34" height="44" rx="2" fill="#fff" />
          <rect x="46" y="104" width="14" height="8" rx="2" fill="#5b6b80" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="40" y={120 + i * 12} width="7" height="7" rx="1.5" fill="none" stroke="#9fb0c4" strokeWidth="1.4" />
              <path className={"prev-check prev-check-" + (i + 1)} d={`M41 ${124 + i * 12} l2.5 2.5 l5 -6`} stroke="#2e8b57" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="51" y={122 + i * 12} width="15" height="3" rx="1.5" fill="#cdd6e2" />
            </g>
          ))}
        </g>
        <circle cx="60" cy="134" r="7" fill="#f1c39c" />
      </g>
    </svg>
  );
}