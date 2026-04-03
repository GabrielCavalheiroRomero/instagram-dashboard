import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import KPICards from "./components/KPICards";
import DailyChart from "./components/DailyChart";
import MediaTable from "./components/MediaTable";

// ✅ Usa variável de ambiente do .env — fallback para Railway em prod
const API = process.env.REACT_APP_API_URL || "https://meta-dashboard-backend-production.up.railway.app";

export default function App() {
  const [daily, setDaily]     = useState([]);
  const [total, setTotal]     = useState({});
  const [media, setMedia]     = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, t, m, h] = await Promise.allSettled([
        fetch(`${API}/insights/daily`).then(r => r.json()),
        fetch(`${API}/insights/total`).then(r => r.json()),
        fetch(`${API}/media`).then(r => r.json()),
        fetch(`${API}/followers/history`).then(r => r.json()),
      ]);

      // Promise.allSettled nunca rejeita — pegamos o valor ou fallback
      const dailyData   = d.status === "fulfilled" && Array.isArray(d.value) ? d.value : [];
      const totalData   = t.status === "fulfilled" && t.value ? t.value : {};
      const mediaData   = m.status === "fulfilled" && Array.isArray(m.value) ? m.value : [];
      const historyData = h.status === "fulfilled" && Array.isArray(h.value) ? h.value : [];

      setDaily(dailyData);
      setTotal(totalData);
      setMedia(mediaData);
      setHistory(historyData);

    } catch (err) {
      setError("Não foi possível conectar à API. Verifique se o backend está online.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── KPI data ─────────────────────────────────────────────────────────────
  // Calcula crescimento real de seguidores comparando os 2 últimos dias do histórico
  const lastTwo = history.slice(-2);
  const followersNow  = lastTwo[1]?.followers ?? total?.followers_count ?? 0;
  const followersPrev = lastTwo[0]?.followers ?? 0;
  const followersChangePct = followersPrev > 0
    ? +((followersNow - followersPrev) / followersPrev * 100).toFixed(1)
    : 0;

  // Reach: último valor do array diário
  const latestReach = daily.length > 0 ? daily[daily.length - 1]?.reach ?? 0 : 0;

  const kpiData = {
    followers_count:       followersNow,
    followers_change:      followersChangePct,   // ✅ calculado do banco real
    profile_views:         total?.profile_views ?? 0,
    profile_views_change:  0,                    // API não retorna comparativo
    reach:                 latestReach,
    reach_change:          0,
    impressions:           0,
    impressions_change:    0,
  };

  // ── Chart data ────────────────────────────────────────────────────────────
  // Funde histórico de seguidores com dados diários de reach por data
  const reachByDate = Object.fromEntries(daily.map(d => [d.date, d.reach]));

  const chartData = history.map(h => ({
    date:            h.date,
    label:           h.date,
    followers_count: h.followers,
    reach:           reachByDate[h.date] ?? 0,
    impressions:     0,
    profile_views:   0,
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex bg-[#0a0a0f] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <Header onRefresh={fetchAll} />

        {/* Banner de erro */}
        {error && (
          <div className="mx-8 mt-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
            <button
              onClick={fetchAll}
              className="ml-auto text-xs underline hover:text-red-300 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="p-8 space-y-8">
          <KPICards data={kpiData} loading={loading} />
          <DailyChart data={chartData} loading={loading} />
          <MediaTable data={media} loading={loading} />
        </div>
      </main>
    </div>
  );
}
