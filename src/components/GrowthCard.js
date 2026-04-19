function Skeleton({ w = 80, h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

function GrowthStat({ label, value, sub, loading }) {
  const isNumber = typeof value === "number";
  const positive = value >= 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      {loading ? <Skeleton w={60} h={24} /> : (
        <>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 22,
            fontWeight: 500,
            color: value === 0 ? "var(--muted)" : positive ? "var(--teal)" : "var(--rose)",
            margin: 0,
            letterSpacing: "-0.5px",
          }}>
            {isNumber && value > 0 ? "+" : ""}{isNumber ? value : value}
          </p>
          {sub && <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>{sub}</p>}
        </>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, background: "var(--border)", margin: "0 28px", flexShrink: 0 }} />;
}

// Subtrai N dias de uma string YYYY-MM-DD
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

export default function GrowthCard({ history, loading }) {
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const latestDate = latest?.date ?? "";
  const latestFollowers = latest?.followers ?? 0;
  const first = sorted[0];
  const days = sorted.length;

  // Busca o registro mais próximo de N dias atrás
  const findClosest = (targetDate) => {
    // Pega o primeiro registro que seja >= targetDate
    const found = sorted.find(d => d.date >= targetDate);
    return found ?? sorted[0];
  };

  // Última semana: comparar com 7 dias atrás
  const weekDate   = subtractDays(latestDate, 7);
  const weekRecord = findClosest(weekDate);
  const weekGrowth = latestFollowers - weekRecord.followers;
  const weekDays   = days >= 7 ? 7 : days;

  // Último mês: comparar com 30 dias atrás
  const monthDate   = subtractDays(latestDate, 30);
  const monthRecord = findClosest(monthDate);
  const monthGrowth = latestFollowers - monthRecord.followers;
  const monthDays   = days >= 30 ? 30 : days;

  // Total histórico
  const totalGrowth = latestFollowers - first.followers;

  // Média diária
  const avgDaily = days > 1 ? +(totalGrowth / (days - 1)).toFixed(1) : 0;

  // Melhor dia
  let bestDay = null;
  let bestGain = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gain = sorted[i].followers - sorted[i-1].followers;
    if (gain > bestGain) { bestGain = gain; bestDay = sorted[i].date; }
  }

  return (
    <section className="fade-up fade-up-3" style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "22px 28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: "var(--text)", margin: 0 }}>
            Crescimento de Seguidores
          </h2>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>
            Baseado em {days} dias de histórico · desde {ptBR(first.date)}
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

      <div style={{ display: "flex", gap: 0 }}>
        <GrowthStat
          label="Última semana"
          value={weekGrowth}
          sub={days < 7 ? `(${weekDays} dias disponíveis)` : null}
          loading={loading}
        />
        <Divider />
        <GrowthStat
          label="Último mês"
          value={monthGrowth}
          sub={days < 30 ? `(${monthDays} dias disponíveis)` : null}
          loading={loading}
        />
        <Divider />
        <GrowthStat
          label="Total histórico"
          value={totalGrowth}
          sub={`${ptBR(first.date)} → ${ptBR(latestDate)}`}
          loading={loading}
        />
        <Divider />
        <GrowthStat
          label="Média por dia"
          value={avgDaily}
          sub="seguidores/dia"
          loading={loading}
        />
      </div>
    </section>
  );
}