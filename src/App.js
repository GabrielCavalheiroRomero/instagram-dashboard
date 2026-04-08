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
      setError("Não foi possível conectar à API.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const lastTwo = history.slice(-2);
  const followersNow  = lastTwo[1]?.followers ?? total?.followers_count ?? 0;
  const followersPrev = lastTwo[0]?.followers ?? 0;
  const followersChangePct = followersPrev > 0
    ? +((followersNow - followersPrev) / followersPrev * 100).toFixed(1) : 0;
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
    username:             total?.username ?? "",
  };

  const followersByDate = Object.fromEntries(history.map(h => [h.date, h.followers]));
  const chartData = (() => {
    const metricsByDate = Object.fromEntries(metricsHistory.map(m => [m.date, m]));
    const reachByDate   = Object.fromEntries(daily.map(d => [d.date, d.reach]));

    // Usa TODAS as datas: daily (30 dias da API) + metricsHistory (histórico salvo)
    const allDates = [...new Set([
      ...daily.map(d => d.date),
      ...metricsHistory.map(m => m.date),
    ])].sort();

    return allDates.map(date => ({
      date,
      label:           date,
      followers_count: followersByDate[date] ?? 0,
      reach:           reachByDate[date] ?? metricsByDate[date]?.reach ?? 0,
      profile_views:   metricsByDate[date]?.profile_views ?? 0,
      impressions:     metricsByDate[date]?.impressions ?? 0,
    }));
  })();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar username={kpiData.username} />
      <main style={{ flex: 1, overflow: "hidden" }}>
        <Header onRefresh={fetchAll} />

        {error && (
          <div style={{ margin: "24px 36px 0", padding: "12px 16px", borderRadius: 10, background: "rgba(224,92,106,0.08)", border: "1px solid rgba(224,92,106,0.20)", color: "var(--rose)", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
            ⚠ {error}
            <button onClick={fetchAll} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--rose)", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
              Tentar novamente
            </button>
          </div>
        )}

        <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
          <KPICards data={kpiData} loading={loading} />
          <DailyChart data={chartData} loading={loading} />
          <MediaTable data={media} loading={loading} />
        </div>
      </main>
    </div>
  );
}