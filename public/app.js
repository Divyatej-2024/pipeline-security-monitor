const byId = (id) => document.getElementById(id);

const trendChart = new Chart(byId("trendChart"), {
  type: "line",
  data: { labels: [], datasets: [{ label: "Events", data: [], borderColor: "#22d3ee", tension: 0.25 }] },
  options: { responsive: true, plugins: { legend: { display: false } } },
});

const threatChart = new Chart(byId("threatChart"), {
  type: "doughnut",
  data: {
    labels: ["brute_force", "active_port_scan", "suspicious_traffic_cluster", "traffic_anomaly_spike"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#f97316", "#eab308", "#ef4444", "#8b5cf6"] }],
  },
  options: { responsive: true },
});

const renderTable = (targetId, rowsHtml) => {
  byId(targetId).innerHTML = rowsHtml.join("");
};

const refresh = async () => {
  const summary = await fetch("/api/dashboard").then((r) => r.json());

  byId("total-events").textContent = summary.totalEvents;
  byId("threats-detected").textContent = summary.threatsDetected;
  byId("high-risk").textContent = summary.highRiskAlerts;
  byId("org-risk").textContent = summary.overallRiskScore;
  byId("org-risk-level").textContent = summary.overallRiskLevel;

  trendChart.data.labels = summary.trend.map((x) => new Date(x.time).toLocaleTimeString());
  trendChart.data.datasets[0].data = summary.trend.map((x) => x.count);
  trendChart.update();

  const threatOrder = threatChart.data.labels;
  threatChart.data.datasets[0].data = threatOrder.map((name) => summary.threatBreakdown[name] || 0);
  threatChart.update();

  renderTable(
    "alert-table",
    summary.recentThreats.slice(0, 12).map(
      (alert) => `<tr><td>${alert.threatType}</td><td>${alert.ipAddress}</td><td>${alert.ipRiskScore}</td><td class="sev-${alert.riskLevel}">${alert.riskLevel}</td><td>${new Date(alert.timestamp).toLocaleString()}</td></tr>`
    )
  );

  renderTable(
    "ip-table",
    summary.topRiskIps.map(
      (item) => `<tr><td>${item.ipAddress}</td><td>${item.score}</td><td class="sev-${item.level}">${item.level}</td></tr>`
    )
  );
};

byId("seed").addEventListener("click", async () => {
  await fetch("/api/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: 900 }) });
  await refresh();
});

byId("reset").addEventListener("click", async () => {
  await fetch("/api/reset", { method: "POST" });
  await refresh();
});

refresh();
setInterval(refresh, 5000);
