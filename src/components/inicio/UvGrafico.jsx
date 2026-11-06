import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const color = (v) => (v < 3 ? "#3c9a4b" : v < 6 ? "#d9b200" : v < 8 ? "#e07b16" : v < 11 ? "#c8352b" : "#7b3fa0");

export default function UvGrafico({ horas }) {
  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={horas} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#6b7778" }} axisLine={false} tickLine={false} interval={1} />
          <Tooltip formatter={(v) => [v, "UV máx."]} labelFormatter={(h) => `${h}:00 h`} />
          <Bar dataKey="valor" radius={[3, 3, 0, 0]}>{horas.map((h, i) => <Cell key={i} fill={color(h.valor)} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}