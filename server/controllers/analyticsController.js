const {
  getMetrics,
  getAlerts,
  getEventTrend,
  getThreatBreakdown,
  getTopRiskAssets,
} = require("../services/analyticsService");
const { acknowledgeAlert } = require("../services/alertService");
const { emitRealtimeUpdate } = require("../sockets/socketServer");

const metricsController = async (req, res, next) => {
  try {
    const metrics = await getMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
};

const alertsController = async (req, res, next) => {
  try {
    const alerts = await getAlerts(req.query.risk || "");
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

const eventTrendController = async (req, res, next) => {
  try {
    const trend = await getEventTrend();
    res.json(trend);
  } catch (error) {
    next(error);
  }
};

const threatBreakdownController = async (req, res, next) => {
  try {
    const breakdown = await getThreatBreakdown();
    res.json(breakdown);
  } catch (error) {
    next(error);
  }
};

const topRiskAssetsController = async (req, res, next) => {
  try {
    const assets = await getTopRiskAssets();
    res.json(assets);
  } catch (error) {
    next(error);
  }
};

const acknowledgeAlertController = async (req, res, next) => {
  try {
    const alert = await acknowledgeAlert(Number(req.params.id));
    if (!alert) return res.status(404).json({ error: "Alert not found" });
    emitRealtimeUpdate({ type: "alert_acknowledged", payload: alert });
    return res.json(alert);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  metricsController,
  alertsController,
  eventTrendController,
  threatBreakdownController,
  topRiskAssetsController,
  acknowledgeAlertController,
};
