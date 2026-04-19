import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import KPICards from "./components/KPICards";
import GrowthCard from "./components/GrowthCard";
import CompareCard from "./components/CompareCard";
import DemographicsCard from "./components/DemographicsCard";
import DailyChart from "./components/DailyChart";
import MediaTable from "./components/MediaTable";

const API = process.env.REACT_APP_API_URL || "https://meta-dashboard-backend-production.up.railway.app";

const todayBrasilia = () => {
  const now = new Date();
  now.setHours(now.getHours() - 3);
  return now.toISOString().split("T")[0];
};

export default function App() {
  const [daily,          setDaily]          = useState([]);
  const [total,          setTotal]          = useState({});
  const [media,          setMedia]          = useState([]);
  const [history,        setHistory]        = useState([]);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [today,          setToday]          = useState(null);
  const [demographics,   setDemographics]   = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, t, m, h, mh, td, demo] = await Promise.allSettled([
        fetch(`${API}/insights/daily`).then(r => r.json()),
        fetch(`${API}/insights/total`).then(r => r.json()),
        fetch(`${API}/media`).then(r => r.json()),
        fetch(`${API}/followers/history`).then(r => r.json()),
        fetch(`${API}/metrics/history`).then(r => r.json()),
        fetch(`${API}/insights/today`).then(r => r.json()),
        fetch(`${API}/insights/demographics`).then(r => r.json()),
      ]);

      setDaily(        d.status    === "fulfilled" && Array.isArray(d.value)    ? d.value    : []);
      setTotal(        t.status    === "fulfilled" && t.value                   ? t.value    : {});
      setMedia(        m.status    === "fulfilled" && Array.isArray(m.value)    ? m.value    : []);
      setHistory(      h.status    === "fulfilled" && Array.isArray(h.value)    ? h.value    : []);
      setMetricsHistory(mh.status  === "fulfilled" && Array.isArray(mh.value)  ? mh.value   : []);
      setToday(        td.status   === "fulfilled" && td.value?.date            ? td.value   : null);
      setDemographics( demo.status === "fulfilled" && demo.value               ? demo.value : null);
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
  const hojeStr = todayBrasilia();

  const chartData = (() => {
    const metricsByDate = Object.fromEntries(metricsHistory.map(m => [m.date, m]));
    const reachByDate   = Object.fromEntries(daily.map(d => [d.date, d.reach]));
    const dailyDates    = daily.map(d => d.date).filter(d => d <= hojeStr);
    const metricsDates  = metricsHistory.map(m => m.date);
    const allDates = [...new Set([...dailyDates, ...metricsDates])].sort();

    const result = allDates.map(date => ({
      date,
      label:           date,
      followers_count: followersByDate[date] ?? 0,
      reach:           reachByDate[date] ?? metricsByDate[date]?.reach ?? 0,
      profile_views:   metricsByDate[date]?.profile_views ?? 0,
      impressions:     metricsByDate[date]?.impressions ?? 0,
      partial:         false,
    }));

    if (today?.date && !allDates.includes(today.date)) {
      result.push({
        date:            today.date,
        label:           today.date,
        followers_count: total?.followers_count ?? 0,
        reach:           today.reach ?? 0,
        profile_views:   today.profile_views ?? 0,
        impressions:     today.impressions ?? 0,
        partial:         true,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
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
          <GrowthCard history={history} loading={loading} />
          <CompareCard chartData={chartData} history={history} loading={loading} />
          <DailyChart data={chartData} loading={loading} />
          <DemographicsCard demographics={demographics} loading={loading} />
          <MediaTable data={media} loading={loading} />
        </div>
      </main>
    </div>
  );
}