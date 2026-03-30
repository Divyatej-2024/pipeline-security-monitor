const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const winston = require("winston");
const { checkForSecrets } = require("./secret");

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const ALERT_THRESHOLD = Number(process.env.ALERT_THRESHOLD || 5);
const ALERT_WINDOW_MS = Number(process.env.ALERT_WINDOW_MS || 5 * 60 * 1000);
const MAX_EVENTS = Number(process.env.MAX_EVENTS || 500);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const state = {
  events: [],
  alerts: [],
  failedLoginsByIp: new Map(),
  portsByIp: new Map(),
};

const pruneOld = (timestamps, windowMs) =>
  timestamps.filter((ts) => Date.now() - ts <= windowMs);

const addEvent = (event) => {
  state.events.unshift(event);
  if (state.events.length > MAX_EVENTS) state.events.pop();
  io.emit("event:new", event);
};

const addAlert = (alert) => {
  state.alerts.unshift(alert);
  if (state.alerts.length > MAX_EVENTS) state.alerts.pop();
  io.emit("alert:new", alert);
};

const trackFailedLogin = (event) => {
  const ip = event.ip || "unknown";
  const timestamps = state.failedLoginsByIp.get(ip) || [];
  const pruned = pruneOld([...timestamps, Date.now()], ALERT_WINDOW_MS);
  state.failedLoginsByIp.set(ip, pruned);
  if (pruned.length >= ALERT_THRESHOLD) {
    addAlert({
      id: `alert-${Date.now()}`,
      type: "brute_force",
      severity: "high",
      ip,
      message: `Multiple failed logins detected from ${ip}`,
      timestamp: new Date().toISOString(),
    });
  }
};

const trackPortScan = (event) => {
  if (!event.port) return;
  const ip = event.ip || "unknown";
  const record = state.portsByIp.get(ip) || { ports: new Set(), lastSeen: [] };
  record.ports.add(event.port);
  record.lastSeen = pruneOld([...record.lastSeen, Date.now()], 60 * 1000);
  state.portsByIp.set(ip, record);
  if (record.ports.size >= 10 && record.lastSeen.length >= 10) {
    addAlert({
      id: `alert-${Date.now()}`,
      type: "port_scan",
      severity: "medium",
      ip,
      message: `Possible port scanning activity from ${ip}`,
      timestamp: new Date().toISOString(),
    });
  }
};

const runDetections = (event) => {
  if (event.type === "auth" && event.outcome === "failed") {
    trackFailedLogin(event);
  }
  if (event.type === "network") {
    trackPortScan(event);
  }
  if (event.type === "code" && typeof event.payload === "string") {
    if (checkForSecrets(event.payload)) {
      addAlert({
        id: `alert-${Date.now()}`,
        type: "secret_exposure",
        severity: "critical",
        message: "Potential secret detected in payload",
        timestamp: new Date().toISOString(),
      });
    }
  }
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/events", (req, res) => {
  res.json({ events: state.events });
});

app.get("/api/alerts", (req, res) => {
  res.json({ alerts: state.alerts });
});

app.post("/api/events", (req, res) => {
  const {
    source = "unknown",
    type = "generic",
    severity = "low",
    message = "event received",
    ip,
    user,
    port,
    outcome,
    payload,
  } = req.body || {};

  const event = {
    id: `evt-${Date.now()}`,
    source,
    type,
    severity,
    message,
    ip,
    user,
    port,
    outcome,
    payload,
    timestamp: new Date().toISOString(),
  };

  addEvent(event);
  runDetections(event);
  logger.info("event_ingested", { event });
  res.status(201).json({ ok: true, event });
});

app.post("/api/simulate", (req, res) => {
  const { scenario = "failed_login" } = req.body || {};
  const ip = "203.0.113.10";

  if (scenario === "failed_login") {
    for (let i = 0; i < ALERT_THRESHOLD; i += 1) {
      addEvent({
        id: `evt-${Date.now()}-${i}`,
        source: "simulator",
        type: "auth",
        severity: "medium",
        message: "Failed login",
        ip,
        outcome: "failed",
        timestamp: new Date().toISOString(),
      });
      runDetections({
        type: "auth",
        outcome: "failed",
        ip,
      });
    }
  }

  if (scenario === "port_scan") {
    for (let port = 20; port < 35; port += 1) {
      addEvent({
        id: `evt-${Date.now()}-${port}`,
        source: "simulator",
        type: "network",
        severity: "medium",
        message: `Port probe ${port}`,
        ip,
        port,
        timestamp: new Date().toISOString(),
      });
      runDetections({
        type: "network",
        ip,
        port,
      });
    }
  }

  if (scenario === "secret") {
    const payload = "api_key='ABCDEFGHIJKLMNOPQRSTUVWXYZ123456'";
    addEvent({
      id: `evt-${Date.now()}`,
      source: "simulator",
      type: "code",
      severity: "high",
      message: "Potential secret in code",
      ip,
      payload,
      timestamp: new Date().toISOString(),
    });
    runDetections({ type: "code", payload });
  }

  res.json({ ok: true, scenario });
});

io.on("connection", (socket) => {
  socket.emit("snapshot", {
    events: state.events,
    alerts: state.alerts,
  });
});

server.listen(PORT, () => {
  logger.info(`Pipeline Security Monitor listening on ${PORT}`);
});
