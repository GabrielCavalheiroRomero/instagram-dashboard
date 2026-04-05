function Skeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />
  );
}

function KPICard({ title, value, change, icon, accent, loading }) {
  const isPositive = change >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118] p-6 flex flex-col gap-4 group hover:border-white/[0.12] transition-colors duration-300">
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500"
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
        {loading ? (
          <Skeleton className="w-16 h-5" />
        ) : (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d={isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
            </svg>
            {Math.abs(change)}%
          </span>
        )}
      </div>

      <div>
        {loading ? (
          <>
            <Skeleton className="h-8 w-28 mb-2" />
            <Skeleton className="h-3.5 w-20" />
          </>
        ) : (
          <>
            <p className="text-3xl font-bold tracking-tight text-white">
              {typeof value === "number" ? value.toLocaleString("pt-BR") : value ?? "—"}
            </p>
            <p className="text-xs text-white/40 mt-1 font-medium uppercase tracking-widest">{title}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function KPICards({ data, loading }) {
  const cards = [
    {
      title: "Seguidores",
      value: data?.followers_count,
      change: data?.followers_change ?? 0,
      accent: "#a78bfa",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Visitas ao Perfil",
      value: data?.profile_views,
      change: data?.profile_views_change ?? 0,
      accent: "#38bdf8",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: "Alcance",
      value: data?.reach,
      change: data?.reach_change ?? 0,
      accent: "#f472b6",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Visualizações",
      value: data?.impressions,
      change: data?.impressions_change ?? 0,
      accent: "#34d399",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <KPICard key={card.title} {...card} loading={loading} />
        ))}
      </div>
    </section>
  );
}