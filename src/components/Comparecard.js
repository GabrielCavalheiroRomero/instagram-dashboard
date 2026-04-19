import { useState } from "react";

function Skeleton({ w = 80, h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

const PERIODOS = [
  { label: "Semana",    days: 7  },
  { label: "15 dias",  days: 15 },
  { label: "Mês",      days: 30 },
];

const METRICAS = [
  { key: "reach",           label: "Alcance",          color: "#e05c6a" },
  { key: "impressions",     label: "Visualizações",     color: "#e8a232" },
  { key: "profile_views",   label: "Visitas ao Perfil", color: "#5b9cf6" },
  { key: "followers_count", label: "Seguidores",        color: "#3bbfa4" },
];

const subtractDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - days);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
};

const ptBR = s => {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${String(y).slice(2)}`;
};

const sum = (data, key) => data.reduce((acc, d) => acc + (d[key] ?? 0), 0);
const avg = (data, key) => data.length ? +(sum(data, key) / data.length).toFixed(1) : 0;

function Delta({ current, previous }) {
  if (previous === 0) return null;
  const pct = +(((current - previous) / previous) * 100).toFixed(1);
  const up = pct >= 0;
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      fontFamily: "'DM Mono', monospace",
      padding: "2px 6px",
      borderRadius: 20,
      background: up ? "rgba(59,191,164,0.10)" : "rgba(224,92,106,0.10)",
      color: up ? "var(--teal)" : "var(--rose)",
      marginLeft: 8,
    }}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

export default function CompareCard({ chartData, loading }) {
  const [periodo, setPeriodo] = useState(7);

  if (!chartData || chartData.length === 0) return null;

  const sorted = [...chartData].sort((a, b) => a.date.localeCompare(b.date));
  const lastDate = sorted[sorted.length - 1]?.date ?? "";

  // Período atual: últimos N dias
  const currentStart = subtractDays(lastDate, periodo - 1);
  const currentData  = sorted.filter(d => d.date >= currentStart && d.date <= lastDate);

  // Período anterior: N dias antes do período atual
  const prevEnd   = subtractDays(currentStart, 1);
  const prevStart = subtractDays(prevEnd, periodo - 1);
  const prevData  = sorted.filter(d => d.date >= prevStart && d.date <= prevEnd);

  return (
    <section className="fade-up fade-up-4" style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "22px 28px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: "var(--text)", margin: 0 }}>
            Comparativo de Períodos
          </h2>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>
            {ptBR(currentStart)} → {ptBR(lastDate)} vs {ptBR(prevStart)} → {ptBR(prevEnd)}
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

      {/* Tabela de comparação */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} w="100%" h={40} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Header da tabela */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: 16, padding: "8px 12px", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Métrica</span>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>
              Período atual
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>
              Período anterior
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>
              Variação
            </span>
          </div>

          {METRICAS.map((m, i) => {
            const curr = m.key === "followers_count"
              ? (currentData[currentData.length - 1]?.[m.key] ?? 0) - (currentData[0]?.[m.key] ?? 0)
              : sum(currentData, m.key);
            const prev = m.key === "followers_count"
              ? (prevData[prevData.length - 1]?.[m.key] ?? 0) - (prevData[0]?.[m.key] ?? 0)
              : sum(prevData, m.key);
            const pct = prev > 0 ? +(((curr - prev) / prev) * 100).toFixed(1) : null;
            const up = pct !== null && pct >= 0;

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
                {/* Métrica */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text)" }}>{m.label}</span>
                </div>

                {/* Atual */}
                <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "'DM Mono', monospace", color: "var(--text)", textAlign: "right" }}>
                  {curr.toLocaleString("pt-BR")}
                </span>

                {/* Anterior */}
                <span style={{ fontSize: 14, fontFamily: "'DM Mono', monospace", color: "var(--muted)", textAlign: "right" }}>
                  {prev.toLocaleString("pt-BR")}
                </span>

                {/* Variação */}
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

      {/* Rodapé informativo */}
      {currentData.length === 0 && !loading && (
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 16 }}>
          Dados insuficientes para este período
        </p>
      )}
    </section>
  );
}