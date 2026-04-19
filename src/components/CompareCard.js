import { useState } from "react";

function Skeleton({ w = 80, h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

const PERIODOS = [
  { label: "Semana",  days: 7  },
  { label: "15 dias", days: 15 },
  { label: "Mês",     days: 30 },
];

const PERIODOS_LABEL = {
  7:  "Semana",
  15: "Quinzena",
  30: "Mês",
};

const METRICAS = [
  { key: "reach",         label: "Alcance",          color: "#e05c6a", type: "sum"    },
  { key: "impressions",   label: "Visualizações",     color: "#e8a232", type: "sum"    },
  { key: "profile_views", label: "Visitas ao Perfil", color: "#5b9cf6", type: "sum"    },
  { key: "followers",     label: "Seguidores",        color: "#3bbfa4", type: "growth" },
];

const todayBrasilia = () => {
  const now = new Date();
  now.setHours(now.getHours() - 3);
  return now.toISOString().split("T")[0];
};

const subtractDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - days);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
};

const ptBR = s => {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}`;
};

// Retorna o número da semana do ano
const weekNumber = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const start = new Date(dt.getFullYear(), 0, 1);
  return Math.ceil(((dt - start) / 86400000 + start.getDay() + 1) / 7);
};

const sum = (data, key) => data.reduce((acc, d) => acc + (d[key] ?? 0), 0);

const followersGrowth = (history, startDate, endDate) => {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const inRange = sorted.filter(d => d.date >= startDate && d.date <= endDate);
  if (inRange.length < 2) return 0;
  return inRange[inRange.length - 1].followers - inRange[0].followers;
};

export default function CompareCard({ chartData, history, loading }) {
  const [periodo, setPeriodo] = useState(7);

  if (!chartData || chartData.length === 0) return null;

  const sorted = [...chartData].sort((a, b) => a.date.localeCompare(b.date));
  const hoje = todayBrasilia();

  // Período atual
  const currentStart = subtractDays(hoje, periodo);
  const currentEnd   = hoje;
  const currentData  = sorted.filter(d => d.date >= currentStart && d.date <= currentEnd);

  // Período anterior
  const prevEnd   = subtractDays(hoje, periodo + 1);
  const prevStart = subtractDays(hoje, periodo * 2);
  const prevData  = sorted.filter(d => d.date >= prevStart && d.date <= prevEnd);

  // Número da semana/período
  const currWeek = weekNumber(currentStart);
  const prevWeek = weekNumber(prevStart);
  const label    = PERIODOS_LABEL[periodo];

  // Título dinâmico
  const titulo = periodo === 7
    ? `${label} ${currWeek} (${ptBR(currentStart)}–${ptBR(currentEnd)}) vs ${label} ${prevWeek} (${ptBR(prevStart)}–${ptBR(prevEnd)})`
    : `${ptBR(currentStart)}–${ptBR(currentEnd)} vs ${ptBR(prevStart)}–${ptBR(prevEnd)}`;

  const getValue = (m, data, startDate, endDate) => {
    if (m.type === "growth") return followersGrowth(history ?? [], startDate, endDate);
    return sum(data, m.key);
  };

  return (
    <section className="fade-up fade-up-4" style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "22px 28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: "var(--text)", margin: 0 }}>
            Comparativo de Períodos
          </h2>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>
            {titulo}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODOS.map(p => (
            <button key={p.days} onClick={() => setPeriodo(p.days)} style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: periodo === p.days ? "1px solid var(--amber)" : "1px solid var(--border)",
              background: periodo === p.days ? "rgba(232,162,50,0.12)" : "transparent",
              color: periodo === p.days ? "var(--amber)" : "var(--muted)",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} w="100%" h={40} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: 16, padding: "8px 12px", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Métrica</span>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>
              {periodo === 7 ? `Semana ${currWeek}` : "Período atual"}
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>
              {periodo === 7 ? `Semana ${prevWeek}` : "Período anterior"}
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Variação</span>
          </div>

          {METRICAS.map((m, i) => {
            const curr = getValue(m, currentData, currentStart, currentEnd);
            const prev = getValue(m, prevData, prevStart, prevEnd);
            const pct  = prev !== 0 ? +(((curr - prev) / Math.abs(prev)) * 100).toFixed(1) : null;
            const up   = pct !== null && pct >= 0;

            return (
              <div key={m.key} style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 80px",
                gap: 16,
                padding: "12px",
                borderRadius: 8,
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text)" }}>{m.label}</span>
                </div>

                <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "'DM Mono', monospace", color: "var(--text)", textAlign: "right" }}>
                  {m.type === "growth" && curr > 0 ? "+" : ""}{curr.toLocaleString("pt-BR")}
                </span>

                <span style={{ fontSize: 14, fontFamily: "'DM Mono', monospace", color: "var(--muted)", textAlign: "right" }}>
                  {m.type === "growth" && prev > 0 ? "+" : ""}{prev.toLocaleString("pt-BR")}
                </span>

                <div style={{ textAlign: "right" }}>
                  {pct !== null ? (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "'DM Mono', monospace",
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: up ? "rgba(59,191,164,0.10)" : "rgba(224,92,106,0.10)",
                      color: up ? "var(--teal)" : "var(--rose)",
                    }}>
                      {up ? "▲" : "▼"} {Math.abs(pct)}%
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentData.length === 0 && !loading && (
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 16 }}>
          Dados insuficientes para este período
        </p>
      )}
    </section>
  );
}