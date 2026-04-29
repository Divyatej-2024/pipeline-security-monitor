const { detectThreatTags } = require("./detectionService");
const { computeRiskScore, classifyRiskLevel } = require("./scoringService");
const { insertEvent } = require("./eventService");
const { createAlertsForThreats } = require("./alertService");
const { getMetrics, getEventTrend, getThreatBreakdown, getTopRiskAssets } = require("./analyticsService");
const { emitRealtimeUpdate } = require("../sockets/socketServer");

const ingestEvent = async (event) => {
  const threatTags = await detectThreatTags(event);
  const riskScore = computeRiskScore({ eventType: event.eventType, threatTags, occurredAt: event.occurredAt });
  const eventRow = await insertEvent({ ...event, riskScore });

  const alerts = await createAlertsForThreats({
    eventId: eventRow.id,
    assetId: eventRow.asset_id,
    sourceIp: eventRow.source_ip,
    threatTags,
    riskScore,
  });

  const metrics = await getMetrics();
  const trend = await getEventTrend();
  const breakdown = await getThreatBreakdown();
  const topRiskAssets = await getTopRiskAssets();

  emitRealtimeUpdate({
    type: "ingest",
    payload: {
      event: eventRow,
      alerts,
      riskLevel: classifyRiskLevel(riskScore),
      metrics,
      trend,
      breakdown,
      topRiskAssets,
    },
  });

  return { event: eventRow, alerts, riskScore, riskLevel: classifyRiskLevel(riskScore), threatTags };
};

module.exports = { ingestEvent };
