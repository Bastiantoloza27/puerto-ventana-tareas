export default function KpiRow({ k }) {
  const items = [
    { label: "Programadas", value: k.prog, note: "en este turno", dark: true, accent: "#00abac" },
    { label: "Ejecutadas", value: k.ok, note: k.pend ? `${k.pend} por registrar` : "todo registrado", accent: "#00abac" },
    { label: "No ejecutadas", value: k.no, note: "con motivo", accent: "#b9574a" },
    { label: "Cumplimiento", value: k.pct + "%", note: k.na ? `excluye ${k.na} «no ocurrió»` : "ejecutadas / programadas", accent: "#c49a1c" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((i) => (
        <div key={i.label} style={{ borderTopColor: i.accent }} className={"border border-t-[3px] rounded-[10px] px-4 py-3.5 flex flex-col gap-1 shadow-[0_1px_2px_rgba(14,42,43,.05),0_6px_18px_rgba(14,42,43,.05)] " + (i.dark ? "bg-[#0e2a2b] text-[#e6efee] border-[#0e2a2b]" : "bg-white text-[#1c2526] border-[#dde5e4]")}>
          <span className="text-xs opacity-75">{i.label}</span>
          <span className="font-mono text-[28px] font-medium">{i.value}</span>
          <span className="text-xs opacity-75">{i.note}</span>
        </div>
      ))}
    </div>
  );
}