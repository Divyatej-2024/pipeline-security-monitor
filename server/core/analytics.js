const { getRiskLevel } = require("./risk");

const summarizeThreats = (alerts) => {
  const summary = {};
  for (const alert of alerts) {
    summary[alert.threatType] = (summary[alert.threatType] || 0) + 1;
  }
  return summary;
};

const buildTrend = (events) => {
  const buckets = new Map();

  for (const event of events) {
    const minute = new Date(event.timestamp);
    minute.setSeconds(0, 0);
    const key = minute.toISOString();
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return [...buckets.entries()]
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .slice(-30)
    .map(([time, count]) => ({ time, count }));
};

const topRiskIps = (byIpRiskMap) =>
  [...byIpRiskMap.entries()]
    .map(([ipAddress, score]) => ({ ipAddress, score, level: getRiskLevel(score) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

const buildInsights = (events, alerts, orgRiskScore) => {
  const topThreat = Object.entries(summarizeThreats(alerts)).sort((a, b) => b[1] - a[1])[0];
  const latestCritical = alerts.find((alert) => alert.riskLevel === "Critical");
  return [
    topThreat
      ? `Top threat pattern: ${topThreat[0]} (${topThreat[1]} detections)`
      : "No threat patterns detected yet.",
    latestCritical
      ? `Critical activity observed from ${latestCritical.ipAddress} at ${latestCritical.timestamp}.`
      : "No critical alerts in current observation window.",
    `Organization risk posture: ${getRiskLevel(orgRiskScore)} (${orgRiskScore} points).`,
    `Events processed in memory: ${events.length}. Alerts raised: ${alerts.length}.`,
  ];
};

module.exports = {
  summarizeThreats,
  buildTrend,
  topRiskIps,
  buildInsights,
};
