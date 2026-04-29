const { DETECTION_WINDOWS } = require("./config");

const withinWindow = (events, windowMs, timestamp) =>
  events.filter((item) => timestamp - item <= windowMs);

const runDetection = (event, signalState) => {
  const ts = new Date(event.timestamp).getTime();
  const ipState =
    signalState.byIp.get(event.ipAddress) ||
    {
      failedLogins: [],
      scannedPorts: [],
      suspiciousTraffic: [],
      allEvents: [],
    };

  ipState.allEvents = withinWindow([...ipState.allEvents, ts], DETECTION_WINDOWS.anomalySpikeMs, ts);

  const detectedThreats = [];

  if (event.eventType === "failed_login") {
    ipState.failedLogins = withinWindow([...ipState.failedLogins, ts], DETECTION_WINDOWS.bruteForceMs, ts);
    if (ipState.failedLogins.length >= DETECTION_WINDOWS.bruteForceCount) {
      detectedThreats.push("brute_force");
    }
  }

  if (event.eventType === "port_scan") {
    ipState.scannedPorts = [...ipState.scannedPorts, { port: event.port || 0, ts }].filter(
      (item) => ts - item.ts <= DETECTION_WINDOWS.portScanMs
    );

    const uniquePorts = new Set(ipState.scannedPorts.map((item) => item.port));
    if (uniquePorts.size >= DETECTION_WINDOWS.portScanPorts) {
      detectedThreats.push("active_port_scan");
    }
  }

  if (event.eventType === "suspicious_traffic") {
    ipState.suspiciousTraffic = withinWindow(
      [...ipState.suspiciousTraffic, ts],
      DETECTION_WINDOWS.suspiciousTrafficMs,
      ts
    );
    if (ipState.suspiciousTraffic.length >= DETECTION_WINDOWS.suspiciousTrafficCount) {
      detectedThreats.push("suspicious_traffic_cluster");
    }
  }

  if (ipState.allEvents.length >= DETECTION_WINDOWS.anomalySpikeCount) {
    detectedThreats.push("traffic_anomaly_spike");
  }

  signalState.byIp.set(event.ipAddress, ipState);
  return detectedThreats;
};

module.exports = { runDetection };
