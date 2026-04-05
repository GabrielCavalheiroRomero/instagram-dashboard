import { useState, useMemo } from "react";
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

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const FILTROS = [
  { label: "7 dias",   value: "7d"  },
  { label: "15 dias",  value: "15d" },
  { label: "30 dias",  value: "30d" },
  { label: "3 meses",  value: "3m"  },
  { label: "6 meses",  value: "6m"  },
  { label: "1 ano",    value: "1y"  },
  { label: "Tudo",     value: "all" },
];

const ptBR = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${String(y).slice(2)}`;
};

const ptBRMes = (dateStr) => {
  if (!dateStr) return "";
  const [y, m] = dateStr.split("-");
  return `${MESES[parseInt(m) - 1].slice(0,3)}/${String(y).slice(2)}`;
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
          <span className="text-white font-semibold ml-auto pl-4">{entry.value?.toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
};

export default function DailyChart({ data, loading }) {
  const [filtro, setFiltro] = useState("30d");

  const chartData = Array.isArray(data) ? data : data?.data ?? [];

  // Filtra os dados conforme o período selecionado
  const filtered = useMemo(() => {
    if (filtro === "all" || chartData.length === 0) return chartData;

    const hoje = new Date();
    const limite = new Date();

    if (filtro === "7d")  limite.setDate(hoje.getDate() - 7);
    if (filtro === "15d") limite.setDate(hoje.getDate() - 15);
    if (filtro === "30d") limite.setDate(hoje.getDate() - 30);
    if (filtro === "3m")  limite.setMonth(hoje.getMonth() - 3);
    if (filtro === "6m")  limite.setMonth(hoje.getMonth() - 6);
    if (filtro === "1y")  limite.setFullYear(hoje.getFullYear() - 1);

    return chartData.filter(d => new Date(d.date) >= limite);
  }, [chartData, filtro]);

  // Para períodos longos, agrupa por mês
  const agruparPorMes = ["3m", "6m", "1y", "all"].includes(filtro) && filtered.length > 60;

  const formatted = useMemo(() => {
    if (!agruparPorMes) {
      return filtered.map(d => ({ ...d, label: ptBR(d.date) }));
    }

    // Agrupa por mês calculando médias
    const grupos = {};
    filtered.forEach(d => {
      const mes = d.date.slice(0, 7); // YYYY-MM
      if (!grupos[mes]) grupos[mes] = { date: mes, count: 0, reach: 0, impressions: 0, profile_views: 0, followers_count: 0 };
      grupos[mes].count++;
      METRICS.forEach(m => { grupos[mes][m.key] += d[m.key] ?? 0; });
    });

    return Object.values(grupos).map(g => ({
      ...g,
      reach:           Math.round(g.reach / g.count),
      impressions:     Math.round(g.impressions / g.count),
      profile_views:   Math.round(g.profile_views / g.count),
      followers_count: Math.round(g.followers_count / g.count),
      label:           ptBRMes(g.date),
    }));
  }, [filtered, agruparPorMes]);

  const maxValue = Math.max(...formatted.flatMap(d => METRICS.map(m => d[m.key] ?? 0)));
  const yMax = Math.ceil((maxValue || 1) * 1.2);

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#111118] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Métricas Diárias</h2>
          <p className="text-xs text-white/30 mt-0.5">
            {formatted.length} {agruparPorMes ? "meses" : "dias"} exibidos
          </p>
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

      {/* Filtros de período */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filtro === f.value
                ? "bg-violet-600 text-white"
                : "bg-white/[0.05] text-white/40 hover:text-white/70 hover:bg-white/[0.08]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="w-full h-72" />
      ) : formatted.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-white/30 text-sm">
          Nenhum dado disponível para este período
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