const EVENT_TYPES = ["failed_login", "port_scan", "suspicious_traffic"];

const SCORE_BY_EVENT = {
  failed_login: 20,
  port_scan: 40,
  suspicious_traffic: 60,
};

const RISK_LEVELS = [
  { min: 0, label: "Low" },
  { min: 120, label: "Medium" },
  { min: 260, label: "High" },
  { min: 420, label: "Critical" },
];

const ALERT_COLORS = {
  Low: "green",
  Medium: "yellow",
  High: "orange",
  Critical: "red",
};

const DETECTION_WINDOWS = {
  bruteForceMs: 10 * 60 * 1000,
  bruteForceCount: 6,
  portScanMs: 3 * 60 * 1000,
  portScanPorts: 12,
  suspiciousTrafficMs: 5 * 60 * 1000,
  suspiciousTrafficCount: 4,
  anomalySpikeMs: 5 * 60 * 1000,
  anomalySpikeCount: 45,
};

module.exports = {
  EVENT_TYPES,
  SCORE_BY_EVENT,
  RISK_LEVELS,
  ALERT_COLORS,
  DETECTION_WINDOWS,
};
