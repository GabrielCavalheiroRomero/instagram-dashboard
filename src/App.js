import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import KPICards from "./components/KPICards";
import DailyChart from "./components/DailyChart";
import MediaTable from "./components/MediaTable";

const API = process.env.REACT_APP_API_URL || "https://meta-dashboard-backend-production.up.railway.app";

export default function App() {
  const [daily,          setDaily]          = useState([]);
  const [total,          setTotal]          = useState({});
  const [media,          setMedia]          = useState([]);
  const [history,        setHistory]        = useState([]);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, t, m, h, mh] = await Promise.allSettled([
        fetch(`${API}/insights/daily`).then(r => r.json()),
        fetch(`${API}/insights/total`).then(r => r.json()),
        fetch(`${API}/media`).then(r => r.json()),
        fetch(`${API}/followers/history`).then(r => r.json()),
        fetch(`${API}/metrics/history`).then(r => r.json()),
      ]);

      setDaily(         d.status  === "fulfilled" && Array.isArray(d.value)  ? d.value  : []);
      setTotal(         t.status  === "fulfilled" && t.value                 ? t.value  : {});
      setMedia(         m.status  === "fulfilled" && Array.isArray(m.value)  ? m.value  : []);
      setHistory(       h.status  === "fulfilled" && Array.isArray(h.value)  ? h.value  : []);
      setMetricsHistory(mh.status === "fulfilled" && Array.isArray(mh.value) ? mh.value : []);

    } catch (err) {
      setError("Não foi possível conectar à API. Verifique se o backend está online.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── KPI data ──────────────────────────────────────────────────────────────
  const lastTwo = history.slice(-2);
  const followersNow      = lastTwo[1]?.followers ?? total?.followers_count ?? 0;
  const followersPrev     = lastTwo[0]?.followers ?? 0;
  const followersChangePct = followersPrev > 0
    ? +((followersNow - followersPrev) / followersPrev * 100).toFixed(1)
    : 0;

  const latestReach = daily.length > 0 ? daily[daily.length - 1]?.reach ?? 0 : 0;

  const kpiData = {
    followers_count:      followersNow,
    followers_change:     followersChangePct,
    profile_views:        total?.profile_views ?? 0,
    profile_views_change: 0,
    reach:                latestReach,
    reach_change:         0,
    impressions:          total?.impressions ?? 0,
    impressions_change:   0,
  };

  // ── Chart data ─────────────────────────────────────────────────────────────
  // Usa metrics/history como base — tem reach, profile_views e impressions por dia
  // Complementa com followers/history por data
  const followersByDate = Object.fromEntries(history.map(h => [h.date, h.followers]));

  // Se metrics/history já tem dados, usa ele como base (cresce todo dia)
  // Caso contrário, usa daily (reach dos últimos 30 dias da API)
const chartData = (() => {
  if (metricsHistory.length === 0) {
    return daily.map(d => ({
      date:            d.date,
      label:           d.date,
      followers_count: followersByDate[d.date] ?? 0,
      reach:           d.reach,
      profile_views:   0,
      impressions:     0,
    }));
  }

  // Funde metrics/history com daily para incluir dias sem histórico salvo
  const metricsByDate = Object.fromEntries(metricsHistory.map(m => [m.date, m]));

  // Pega todas as datas únicas de daily + metricsHistory
  const allDates = [...new Set([
    ...daily.map(d => d.date),
    ...metricsHistory.map(m => m.date),
  ])].sort();

  const reachByDate = Object.fromEntries(daily.map(d => [d.date, d.reach]));

  return allDates.map(date => ({
    date,
    label:           date,
    followers_count: followersByDate[date] ?? 0,
    reach:           metricsByDate[date]?.reach ?? reachByDate[date] ?? 0,
    profile_views:   metricsByDate[date]?.profile_views ?? 0,
    impressions:     metricsByDate[date]?.impressions ?? 0,
  }));
})();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex bg-[#0a0a0f] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <Header onRefresh={fetchAll} />

        {error && (
          <div className="mx-8 mt-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
            <button onClick={fetchAll} className="ml-auto text-xs underline hover:text-red-300 transition-colors">
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