const { query } = require("../db/pool");

const detectThreatTags = async (event) => {
  const tags = new Set([event.eventType]);

  const bruteForceSql = `
    SELECT COUNT(*)::int AS count
    FROM events
    WHERE source_ip = $1
      AND event_type = 'failed_login'
      AND occurred_at >= NOW() - INTERVAL '10 minutes'
  `;
  const bruteForceRes = await query(bruteForceSql, [event.sourceIp]);
  if (bruteForceRes.rows[0].count >= 6) tags.add("brute_force");

  const scanSql = `
    SELECT COUNT(DISTINCT COALESCE((metadata->>'port')::int, 0))::int AS distinct_ports
    FROM events
    WHERE source_ip = $1
      AND occurred_at >= NOW() - INTERVAL '5 minutes'
  `;
  const scanRes = await query(scanSql, [event.sourceIp]);
  if (scanRes.rows[0].distinct_ports >= 12) tags.add("port_scanning");

  const anomalySql = `
    SELECT COUNT(*)::int AS count
    FROM events
    WHERE asset_id = $1
      AND occurred_at >= NOW() - INTERVAL '15 minutes'
  `;
  const anomalyRes = await query(anomalySql, [event.assetId]);
  if (anomalyRes.rows[0].count >= 50) tags.add("behavior_anomaly");

  return [...tags];
};

module.exports = { detectThreatTags };
