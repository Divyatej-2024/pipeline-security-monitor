const { EVENT_TYPES } = require("../core/config");

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomIp = () => `${random(11, 223)}.${random(0, 255)}.${random(0, 255)}.${random(1, 254)}`;

const weightedEventType = () => {
  const roll = Math.random();
  if (roll < 0.55) return "failed_login";
  if (roll < 0.82) return "port_scan";
  return "suspicious_traffic";
};

const createEvent = (ipAddress, eventType, timestamp) => ({
  ipAddress,
  eventType: EVENT_TYPES.includes(eventType) ? eventType : weightedEventType(),
  timestamp,
  port: eventType === "port_scan" ? random(1, 65535) : null,
  bytes: eventType === "suspicious_traffic" ? random(2000, 450000) : random(50, 1200),
  protocol: Math.random() > 0.5 ? "tcp" : "udp",
  sourceSystem: Math.random() > 0.5 ? "ci-runner" : "runtime-sensor",
});

const generateSampleEvents = (count = 800) => {
  const total = Math.max(500, Math.min(count, 1000));
  const events = [];
  const start = Date.now() - 90 * 60 * 1000;

  const bruteIp = "185.199.111.77";
  const scanIp = "103.44.21.190";
  const trafficIp = "91.240.118.15";

  for (let i = 0; i < total; i += 1) {
    const timestamp = new Date(start + i * 7000).toISOString();

    if (i % 22 === 0) {
      events.push(createEvent(bruteIp, "failed_login", timestamp));
      continue;
    }

    if (i % 27 === 0) {
      events.push(createEvent(scanIp, "port_scan", timestamp));
      continue;
    }

    if (i % 35 === 0) {
      events.push(createEvent(trafficIp, "suspicious_traffic", timestamp));
      continue;
    }

    events.push(createEvent(randomIp(), weightedEventType(), timestamp));
  }

  return events;
};

module.exports = { generateSampleEvents };
