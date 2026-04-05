function Skeleton({ w = 80, h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

const CARDS = [
  { key: "followers_count",  changeKey: "followers_change",     label: "Seguidores",       color: "var(--amber)", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "profile_views",    changeKey: "profile_views_change", label: "Visitas ao Perfil", color: "var(--blue)",  icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  { key: "reach",            changeKey: "reach_change",         label: "Alcance",           color: "var(--rose)",  icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { key: "impressions",      changeKey: "impressions_change",   label: "Visualizações",     color: "var(--teal)",  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

export default function KPICards({ data, loading }) {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {CARDS.map((card, i) => {
        const value  = data?.[card.key]  ?? 0;
        const change = data?.[card.changeKey] ?? 0;
        const up     = change >= 0;

        return (
          <div key={card.key} className={`fade-up fade-up-${i + 1}`} style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            transition: "border-color 0.2s",
            cursor: "default",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: card.color,
              }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>

              {loading ? <Skeleton w={52} h={20} /> : (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "'DM Mono', monospace",
                  padding: "3px 8px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  background: up ? "rgba(59,191,164,0.10)" : "rgba(224,92,106,0.10)",
                  color: up ? "var(--teal)" : "var(--rose)",
                }}>
                  {up ? "▲" : "▼"} {Math.abs(change)}%
                </span>
              )}
            </div>

            {/* Value */}
            <div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skeleton w={100} h={32} />
                  <Skeleton w={70} h={12} />
                </div>
              ) : (
                <>
                  <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 28,
                    fontWeight: 500,
                    color: "var(--text)",
                    margin: 0,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.1,
                  }}>
                    {typeof value === "number" ? value.toLocaleString("pt-BR") : value ?? "—"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "6px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {card.label}
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
