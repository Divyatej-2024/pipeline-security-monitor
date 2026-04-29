import React, { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import { connectSocket } from "./services/socket";
import { MetricCard } from "./components/MetricCard";
import { AlertsTable } from "./components/AlertsTable";
import { TrendPanel } from "./components/TrendPanel";
import { BreakdownPanel } from "./components/BreakdownPanel";
import { TopAssetsPanel } from "./components/TopAssetsPanel";
import { FilterBar } from "./components/FilterBar";

export default function App() {
  const [metrics, setMetrics] = useState({ total_events: 0, open_alerts: 0, high_priority_alerts: 0, total_risk: 0 });
  const [alerts, setAlerts] = useState([]);
  const [trend, setTrend] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [assets, setAssets] = useState([]);
  const [riskFilter, setRiskFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedIp, setSelectedIp] = useState("");

  const refreshAll = async () => {
    const [m, a, t, b, x] = await Promise.all([
      api.getMetrics(),
      api.getAlerts(riskFilter),
      api.getTrend(),
      api.getBreakdown(),
      api.getTopAssets(),
    ]);
    setMetrics(m);
    setAlerts(a);
    setTrend(t);
    setBreakdown(b);
    setAssets(x);
  };

  useEffect(() => { refreshAll(); }, [riskFilter]);

  useEffect(() => {
    const socket = connectSocket();
    socket.on("soc:update", ({ payload }) => {
      setMetrics(payload.metrics);
      setTrend(payload.trend);
      setBreakdown(payload.breakdown);
      setAssets(payload.topRiskAssets);
      setAlerts((prev) => [...payload.alerts, ...prev].slice(0, 200));
    });

    socket.on("alert_acknowledged", (alert) => {
      setAlerts((prev) => prev.map((x) => (x.id === alert.id ? alert : x)));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => { refreshAll(); }, 10000);
    return () => clearInterval(id);
  }, [autoRefresh, riskFilter]);

  const filteredAlerts = useMemo(
    () => (selectedIp ? alerts.filter((a) => a.source_ip === selectedIp) : alerts),
    [alerts, selectedIp]
  );

  const onAcknowledge = async (id) => {
    await api.acknowledgeAlert(id);
    await refreshAll();
  };

  return (
    <div style={{ background: "#081017", minHeight: "100vh", color: "#e5eef5", padding: 20, fontFamily: "Segoe UI" }}>
      <h1>PipeSentinel SOC Console</h1>
      <FilterBar riskFilter={riskFilter} setRiskFilter={setRiskFilter} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} selectedIp={selectedIp} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
        <MetricCard label="Total Events" value={metrics.total_events} accent="#22d3ee" />
        <MetricCard label="Open Alerts" value={metrics.open_alerts} accent="#f97316" />
        <MetricCard label="High/Critical" value={metrics.high_priority_alerts} accent="#ef4444" />
        <MetricCard label="Aggregate Risk" value={metrics.total_risk} accent="#facc15" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 12 }}>
        <TrendPanel trend={trend} />
        <BreakdownPanel breakdown={breakdown} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <AlertsTable alerts={filteredAlerts} onAcknowledge={onAcknowledge} onSelectIp={setSelectedIp} />
        <TopAssetsPanel assets={assets} />
      </div>
    </div>
  );
}
