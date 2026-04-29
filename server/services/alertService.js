const { query } = require("../db/pool");

const createAlertsForThreats = async ({ eventId, assetId, sourceIp, threatTags, riskScore }) => {
  const criticalTags = new Set(["brute_force", "port_scanning", "behavior_anomaly", "malware_download"]);

  const inserted = [];
  for (const threatType of threatTags) {
    const sql = `
      INSERT INTO alerts (event_id, asset_id, source_ip, threat_type, priority, risk_score, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'open')
      RETURNING *
    `;

    const priority = riskScore >= 700 || criticalTags.has(threatType)
      ? "critical"
      : riskScore >= 420
        ? "high"
        : riskScore >= 220
          ? "medium"
          : "low";

    const result = await query(sql, [eventId, assetId, sourceIp, threatType, priority, riskScore]);
    inserted.push(result.rows[0]);
  }

  return inserted;
};

const acknowledgeAlert = async (id) => {
  const sql = `
    UPDATE alerts
    SET status = 'acknowledged', acknowledged_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

module.exports = { createAlertsForThreats, acknowledgeAlert };
