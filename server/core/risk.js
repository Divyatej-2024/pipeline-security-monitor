const { SCORE_BY_EVENT, RISK_LEVELS, ALERT_COLORS } = require("./config");

const getRiskLevel = (score) => {
  let level = "Low";
  for (const band of RISK_LEVELS) {
    if (score >= band.min) level = band.label;
  }
  return level;
};

const getSeverityWeight = (threatType) => {
  if (threatType === "brute_force") return 30;
  if (threatType === "active_port_scan") return 50;
  if (threatType === "suspicious_traffic_cluster") return 70;
  if (threatType === "traffic_anomaly_spike") return 80;
  return 0;
};

const eventScore = (eventType) => SCORE_BY_EVENT[eventType] || 0;

const scoreEvent = (eventType, detectedThreats) => {
  const threatScore = detectedThreats.reduce((sum, t) => sum + getSeverityWeight(t), 0);
  return eventScore(eventType) + threatScore;
};

const toPriority = (riskLevel) => ({
  riskLevel,
  color: ALERT_COLORS[riskLevel],
});

module.exports = {
  getRiskLevel,
  scoreEvent,
  toPriority,
};
