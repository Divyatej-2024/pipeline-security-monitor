const ALLOWED_EVENT_TYPES = [
  "failed_login",
  "port_scan",
  "suspicious_traffic",
  "malware_download",
  "policy_violation",
  "anomalous_login",
];

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const validateIngestPayload = (req, res, next) => {
  const body = req.body || {};
  const { sourceIp, assetId, eventType, occurredAt } = body;

  if (!sourceIp || !IPV4.test(String(sourceIp))) {
    return res.status(400).json({ error: "sourceIp must be a valid IPv4 address" });
  }
  if (!assetId || typeof assetId !== "string") {
    return res.status(400).json({ error: "assetId is required" });
  }
  if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
    return res.status(400).json({ error: `eventType must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}` });
  }
  if (occurredAt && Number.isNaN(new Date(occurredAt).getTime())) {
    return res.status(400).json({ error: "occurredAt must be a valid timestamp" });
  }

  req.validatedEvent = {
    sourceIp: String(sourceIp),
    assetId: String(assetId),
    eventType,
    metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
    occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
  };

  return next();
};

module.exports = { validateIngestPayload, ALLOWED_EVENT_TYPES };
