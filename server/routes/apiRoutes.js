const express = require("express");
const { metricsController, alertsController, eventTrendController, threatBreakdownController, topRiskAssetsController, acknowledgeAlertController } = require("../controllers/analyticsController");
const { ingestController } = require("../controllers/ingestController");
const { requireIngestionApiKey } = require("../middleware/apiKeyAuth");
const { validateIngestPayload } = require("../middleware/validate");

const router = express.Router();

router.get("/metrics", metricsController);
router.get("/alerts", alertsController);
router.get("/events/trend", eventTrendController);
router.get("/threats/breakdown", threatBreakdownController);
router.get("/assets/top-risks", topRiskAssetsController);
router.post("/alerts/:id/acknowledge", acknowledgeAlertController);
router.post("/ingest", requireIngestionApiKey, validateIngestPayload, ingestController);

module.exports = { apiRouter: router };
