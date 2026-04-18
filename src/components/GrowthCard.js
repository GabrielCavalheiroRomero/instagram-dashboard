function Skeleton({ w = 80, h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

function GrowthStat({ label, value, loading }) {
  const positive = value >= 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      {loading ? <Skeleton w={60} h={24} /> : (
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 22,
          fontWeight: 500,
          color: value === 0 ? "var(--muted)" : positive ? "var(--teal)" : "var(--rose)",
          margin: 0,
          letterSpacing: "-0.5px",
        }}>
          {value > 0 ? "+" : ""}{value}
        </p>
      )}
    </div>
  );
}

export default function GrowthCard({ history, loading }) {
  if (!history || history.length === 0) return null;

  // Ordena por data
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const latestFollowers = latest?.followers ?? 0;

  // Crescimento na semana (últimos 7 dias)
  const weekAgo = sorted.find((_, i) => sorted.length - 1 - i >= 6) ?? sorted[0];
  const weekGrowth = latestFollowers - (weekAgo?.followers ?? latestFollowers);

  // Crescimento no mês (últimos 30 dias)
  const monthAgo = sorted.find((_, i) => sorted.length - 1 - i >= 29) ?? sorted[0];
  const monthGrowth = latestFollowers - (monthAgo?.followers ?? latestFollowers);

  // Crescimento total (desde o primeiro registro)
  const first = sorted[0];
  const totalGrowth = latestFollowers - (first?.followers ?? latestFollowers);

  // Média diária
  const days = sorted.length;
  const avgDaily = days > 1 ? +(totalGrowth / (days - 1)).toFixed(1) : 0;

  // Melhor dia
  let bestDay = null;
  let bestGain = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gain = sorted[i].followers - sorted[i-1].followers;
    if (gain > bestGain) { bestGain = gain; bestDay = sorted[i].date; }
  }

  const ptBR = s => {
    if (!s) return "—";
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${String(y).slice(2)}`;
  };

  return (
    <section className="fade-up fade-up-3" style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "22px 28px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: "var(--text)", margin: 0 }}>
            Crescimento de Seguidores
          </h2>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>
            Baseado em {days} dias de histórico
          </p>
        </div>
        {bestDay && !loading && (
          <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "right" }}>
            <span>Melhor dia: </span>
            <span style={{ color: "var(--amber)", fontFamily: "'DM Mono', monospace" }}>
              {ptBR(bestDay)} (+{bestGain})
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 0 }}>
        <GrowthStat label="Última semana"  value={weekGrowth}       loading={loading} />
        <Divider />
        <GrowthStat label="Último mês"     value={monthGrowth}      loading={loading} />
        <Divider />
        <GrowthStat label="Total histórico" value={totalGrowth}     loading={loading} />
        <Divider />
        <GrowthStat label="Média por dia"  value={avgDaily}         loading={loading} />
      </div>
    </section>
  );
}

function Divider() {
  return <div style={{ width: 1, background: "var(--border)", margin: "0 28px", flexShrink: 0 }} />;
}