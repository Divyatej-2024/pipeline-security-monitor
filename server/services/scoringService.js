const baseWeights = {
  failed_login: 20,
  port_scan: 35,
  suspicious_traffic: 45,
  malware_download: 80,
  policy_violation: 30,
  anomalous_login: 50,
};

const threatWeights = {
  brute_force: 70,
  port_scanning: 60,
  behavior_anomaly: 65,
  suspicious_traffic: 45,
  malware_download: 80,
  policy_violation: 30,
  anomalous_login: 50,
};

const classifyRiskLevel = (score) => {
  if (score >= 700) return "Critical";
  if (score >= 420) return "High";
  if (score >= 220) return "Medium";
  return "Low";
};

const calculateTimeDecay = (occurredAt) => {
  const ageHours = Math.max(0, (Date.now() - new Date(occurredAt).getTime()) / (1000 * 60 * 60));
  const factor = Math.exp(-0.065 * ageHours);
  return Math.max(0.15, Number(factor.toFixed(4)));
};

const computeRiskScore = ({ eventType, threatTags, occurredAt }) => {
  const base = baseWeights[eventType] || 10;
  const threatScore = threatTags.reduce((sum, tag) => sum + (threatWeights[tag] || 0), 0);
  const decayed = (base + threatScore) * calculateTimeDecay(occurredAt);
  return Math.round(decayed);
};

module.exports = { computeRiskScore, classifyRiskLevel };
