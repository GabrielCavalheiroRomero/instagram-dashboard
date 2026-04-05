import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />;
}

const METRICS = [
  { key: "reach",           label: "Alcance",          color: "#f472b6" },
  { key: "impressions",     label: "Visualizações",     color: "#a78bfa" },
  { key: "profile_views",   label: "Visitas ao Perfil", color: "#38bdf8" },
  { key: "followers_count", label: "Seguidores",        color: "#34d399" },
];

const ptBR = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${String(y).slice(2)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a27] border border-white/[0.1] rounded-xl p-4 shadow-2xl text-sm">
      <p className="text-white/50 text-xs mb-3 font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2.5 mb-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/60">{entry.name}:</span>
          <span className="text-white font-semibold ml-auto pl-4">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function DailyChart({ data, loading }) {
  const chartData = Array.isArray(data) ? data : data?.data ?? [];

  const formatted = chartData.map((d) => ({
    ...d,
    label: ptBR(d.date || d.label),
  }));

  // Calcula o valor máximo de todas as métricas e adiciona 20%
  const maxValue = Math.max(
    ...formatted.flatMap(d => METRICS.map(m => d[m.key] ?? 0))
  );
  const yMax = Math.ceil(maxValue * 1.2);

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#111118] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Métricas Diárias</h2>
          <p className="text-xs text-white/30 mt-0.5">Evolução ao longo do tempo</p>
        </div>
        <div className="flex items-center gap-4">
          {METRICS.map((m) => (
            <div key={m.key} className="hidden md:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-xs text-white/40">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="w-full h-72" />
      ) : formatted.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-white/30 text-sm">
          Nenhum dado disponível
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
            {METRICS.map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}