const { EVENT_TYPES } = require("./config");

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const parseTimestamp = (value) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid timestamp format");
  }
  return parsed.toISOString();
};

const validateEventPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Event payload must be an object");
  }

  const ipAddress = String(payload.ipAddress || "").trim();
  const eventType = String(payload.eventType || "").trim();

  if (!IPV4_REGEX.test(ipAddress)) {
    throw new Error("Invalid ipAddress. Use a valid IPv4 address");
  }

  if (!EVENT_TYPES.includes(eventType)) {
    throw new Error(`Invalid eventType. Allowed: ${EVENT_TYPES.join(", ")}`);
  }

  return {
    ipAddress,
    eventType,
    timestamp: parseTimestamp(payload.timestamp),
    port: Number(payload.port || 0) || null,
    bytes: Number(payload.bytes || 0) || null,
    protocol: payload.protocol ? String(payload.protocol) : null,
    sourceSystem: payload.sourceSystem ? String(payload.sourceSystem) : "pipeline-ingestor",
  };
};

module.exports = { validateEventPayload };
