import { useState, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const METRICS = [
  { key: "reach",           label: "Alcance",          color: "#e05c6a" },
  { key: "impressions",     label: "Visualizações",     color: "#e8a232" },
  { key: "profile_views",   label: "Visitas ao Perfil", color: "#5b9cf6" },
  { key: "followers_count", label: "Seguidores",        color: "#3bbfa4" },
];

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const FILTROS = [
  { label: "7D",   value: "7d"  },
  { label: "15D",  value: "15d" },
  { label: "30D",  value: "30d" },
  { label: "3M",   value: "3m"  },
  { label: "6M",   value: "6m"  },
  { label: "1A",   value: "1y"  },
  { label: "Tudo", value: "all" },
];

// Converte "YYYY-MM-DD" para Date local sem problema de timezone
const parseDate = s => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const ptBR    = s => { if (!s) return ""; const [y,m,d] = s.split("-"); return `${d}/${m}/${String(y).slice(2)}`; };
const ptBRMes = s => { if (!s) return ""; const [y,m]   = s.split("-"); return `${MESES[parseInt(m)-1]}/${String(y).slice(2)}`; };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontFamily: "'DM Mono', monospace", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <p style={{ color: "var(--muted)", marginBottom: 8, fontSize: 11 }}>{label}</p>
      {payload.map(e => (
        <div key={e.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
          <span style={{ color: "var(--muted)" }}>{e.name}:</span>
          <span style={{ color: "var(--text)", fontWeight: 500, marginLeft: "auto", paddingLeft: 12 }}>{e.value?.toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
};

export default function DailyChart({ data, loading }) {
  const [filtro, setFiltro] = useState("30d");
  const chartData = Array.isArray(data) ? data : data?.data ?? [];

  const filtered = useMemo(() => {
    // "Tudo" = todo o histórico disponível
    if (filtro === "all" || !chartData.length) return chartData;

    // Data de hoje em horário local (sem timezone bug)
    const hoje = new Date();
    const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    if (filtro === "7d")  limite.setDate(limite.getDate() - 6);
    if (filtro === "15d") limite.setDate(limite.getDate() - 14);
    if (filtro === "30d") limite.setDate(limite.getDate() - 29);
    if (filtro === "3m")  limite.setMonth(limite.getMonth() - 3);
    if (filtro === "6m")  limite.setMonth(limite.getMonth() - 6);
    if (filtro === "1y")  limite.setFullYear(limite.getFullYear() - 1);

    return chartData.filter(d => parseDate(d.date) >= limite);
  }, [chartData, filtro]);

  const agrupar = ["3m","6m","1y","all"].includes(filtro) && filtered.length > 60;

  const formatted = useMemo(() => {
    if (!agrupar) return filtered.map(d => ({ ...d, label: ptBR(d.date) }));
    const g = {};
    filtered.forEach(d => {
      const mes = d.date.slice(0,7);
      if (!g[mes]) g[mes] = { date: mes, count: 0, reach: 0, impressions: 0, profile_views: 0, followers_count: 0 };
      g[mes].count++;
      METRICS.forEach(m => { g[mes][m.key] += d[m.key] ?? 0; });
    });
    return Object.values(g).map(x => ({
      ...x,
      reach:           Math.round(x.reach / x.count),
      impressions:     Math.round(x.impressions / x.count),
      profile_views:   Math.round(x.profile_views / x.count),
      followers_count: Math.round(x.followers_count / x.count),
      label:           ptBRMes(x.date),
    }));
  }, [filtered, agrupar]);

  const maxVal = Math.max(...formatted.flatMap(d => METRICS.map(m => d[m.key] ?? 0)));
  const yMax   = Math.ceil((maxVal || 1) * 1.2);

  return (
    <section className="fade-up fade-up-4" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 24px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: "var(--text)", margin: 0 }}>Métricas Diárias</h2>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>
            {formatted.length} {agrupar ? "meses" : "dias"} exibidos
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {METRICS.map(m => (
            <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {FILTROS.map(f => (
          <button key={f.value} onClick={() => setFiltro(f.value)} style={{
            padding: "5px 12px",
            borderRadius: 6,
            border: filtro === f.value ? "1px solid var(--amber)" : "1px solid var(--border)",
            background: filtro === f.value ? "rgba(232,162,50,0.12)" : "transparent",
            color: filtro === f.value ? "var(--amber)" : "var(--muted)",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "'DM Mono', monospace",
            cursor: "pointer",
            transition: "all 0.15s",
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ height: 280, borderRadius: 8, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
      ) : formatted.length === 0 ? (
        <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>
          Nenhum dado para este período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formatted} margin={{ top: 5, right: 24, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              interval={formatted.length <= 15 ? 0 : Math.ceil(formatted.length / 8)}
              padding={{ right: 20 }}
            />            
            <YAxis
              domain={[0, yMax]}
              tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }} />
            {METRICS.map(m => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={1.8}
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