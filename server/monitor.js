const express = require("express");
const cors = require("cors");
const winston = require("winston");
const { validateEventPayload } = require("./core/validation");
const { runDetection } = require("./core/detection");
const { getRiskLevel, scoreEvent, toPriority } = require("./core/risk");
const { summarizeThreats, buildTrend, topRiskIps, buildInsights } = require("./core/analytics");
const { state, appendWithCap, upsertIpRisk, resetStore } = require("./core/store");
const { generateSampleEvents } = require("./data/generator");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

const buildAlert = (event, threatType, eventRisk, ipRiskScore) => {
  const riskLevel = getRiskLevel(Math.max(eventRisk, ipRiskScore));
  const priority = toPriority(riskLevel);

  return {
    id: `alt-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    threatType,
    ipAddress: event.ipAddress,
    timestamp: event.timestamp,
    eventRisk,
    ipRiskScore,
    riskLevel,
    priorityColor: priority.color,
    message: `${threatType} detected for ${event.ipAddress}`,
  };
};

const ingestEvent = (rawPayload) => {
  const event = validateEventPayload(rawPayload);
  const detectedThreats = runDetection(event, state.signalState);
  const eventRisk = scoreEvent(event.eventType, detectedThreats);
  const ipRiskScore = upsertIpRisk(event.ipAddress, eventRisk);
  state.orgRiskScore += eventRisk;

  const enrichedEvent = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    ...event,
    detectedThreats,
    eventRisk,
    ipRiskScore,
    riskLevel: getRiskLevel(ipRiskScore),
  };

  appendWithCap(state.events, enrichedEvent);

  for (const threatType of detectedThreats) {
    appendWithCap(state.alerts, buildAlert(event, threatType, eventRisk, ipRiskScore));
  }

  return enrichedEvent;
};

const ingestBatch = (events) => {
  for (const item of events) {
    ingestEvent(item);
  }
};

const buildDashboardSummary = () => {
  const highRiskAlerts = state.alerts.filter((alert) => ["High", "Critical"].includes(alert.riskLevel)).length;

  return {
    totalEvents: state.events.length,
    threatsDetected: state.alerts.length,
    highRiskAlerts,
    overallRiskScore: state.orgRiskScore,
    overallRiskLevel: getRiskLevel(state.orgRiskScore),
    topRiskIps: topRiskIps(state.byIpRisk),
    trend: buildTrend(state.events),
    threatBreakdown: summarizeThreats(state.alerts),
    recentThreats: state.alerts.slice(0, 20),
  };
};

const buildReport = () => {
  const summary = buildDashboardSummary();
  return {
    generatedAt: new Date().toISOString(),
    threatSummary: summary.threatBreakdown,
    riskOverview: {
      organizationRiskScore: summary.overallRiskScore,
      organizationRiskLevel: summary.overallRiskLevel,
      highRiskAlerts: summary.highRiskAlerts,
      topRiskIps: summary.topRiskIps,
    },
    keyInsights: buildInsights(state.events, state.alerts, state.orgRiskScore),
    trendAnalysis: summary.trend,
  };
};

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "PipeSentinel", timestamp: new Date().toISOString() });
  });

  app.post("/api/events", (req, res) => {
    try {
      const ingested = ingestEvent(req.body);
      logger.info("event_ingested", { eventId: ingested.id, ipAddress: ingested.ipAddress });
      res.status(201).json({ ok: true, event: ingested });
    } catch (error) {
      res.status(400).json({ ok: false, error: error.message });
    }
  });

  app.post("/api/events/batch", (req, res) => {
    const events = Array.isArray(req.body?.events) ? req.body.events : [];
    if (!events.length) return res.status(400).json({ ok: false, error: "events array is required" });

    const accepted = [];
    const rejected = [];

    for (const candidate of events) {
      try {
        accepted.push(ingestEvent(candidate));
      } catch (error) {
        rejected.push({ payload: candidate, reason: error.message });
      }
    }

    res.status(207).json({ ok: true, accepted: accepted.length, rejected: rejected.length, rejectedItems: rejected });
  });

  app.post("/api/simulate", (req, res) => {
    const count = Number(req.body?.count || 800);
    ingestBatch(generateSampleEvents(count));
    res.json({ ok: true, generated: Math.max(500, Math.min(count, 1000)) });
  });

  app.get("/api/events", (req, res) => {
    res.json({ events: state.events.slice(0, 200) });
  });

  app.get("/api/alerts", (req, res) => {
    const sorted = [...state.alerts].sort((a, b) => {
      const levelRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return levelRank[b.riskLevel] - levelRank[a.riskLevel];
    });
    res.json({ alerts: sorted.slice(0, 200) });
  });

  app.get("/api/dashboard", (req, res) => {
    res.json(buildDashboardSummary());
  });

  app.get("/report", (req, res) => {
    res.json(buildReport());
  });

  app.post("/api/reset", (req, res) => {
    resetStore();
    ingestBatch(generateSampleEvents(800));
    res.json({ ok: true, message: "State reset with fresh sample telemetry" });
  });

  if (!state.events.length) {
    ingestBatch(generateSampleEvents(800));
  }

  return app;
};

module.exports = { createApp };
