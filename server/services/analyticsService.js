const { query } = require("../db/pool");

const getMetrics = async () => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM events) AS total_events,
      (SELECT COUNT(*) FROM alerts WHERE status = 'open') AS open_alerts,
      (SELECT COUNT(*) FROM alerts WHERE priority IN ('high','critical') AND status = 'open') AS high_priority_alerts,
      (SELECT COALESCE(SUM(risk_score), 0) FROM alerts WHERE status = 'open') AS total_risk
  `;
  const result = await query(sql);
  return result.rows[0];
};

const getAlerts = async (riskLevel) => {
  const params = [];
  let where = "";
  if (riskLevel) {
    params.push(riskLevel.toLowerCase());
    where = "WHERE priority = $1";
  }

  const sql = `
    SELECT id, source_ip, threat_type, priority, risk_score, status, created_at, acknowledged_at
    FROM alerts
    ${where}
    ORDER BY
      CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END,
      created_at DESC
    LIMIT 200
  `;
  const result = await query(sql, params);
  return result.rows;
};

const getEventTrend = async () => {
  const sql = `
    SELECT to_char(date_trunc('minute', occurred_at), 'YYYY-MM-DD"T"HH24:MI:00"Z"') AS time,
           COUNT(*)::int AS count
    FROM events
    WHERE occurred_at >= NOW() - INTERVAL '2 hours'
    GROUP BY 1
    ORDER BY 1
  `;
  const result = await query(sql);
  return result.rows;
};

const getThreatBreakdown = async () => {
  const sql = `
    SELECT threat_type, COUNT(*)::int AS count
    FROM alerts
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY threat_type
    ORDER BY count DESC
  `;
  const result = await query(sql);
  return result.rows;
};

const getTopRiskAssets = async () => {
  const sql = `
    SELECT a.asset_id, a.ip_address,
           COALESCE(SUM(al.risk_score), 0)::int AS risk_score,
           COUNT(al.id)::int AS alert_count
    FROM assets a
    LEFT JOIN alerts al ON al.asset_id = a.id AND al.status = 'open'
    GROUP BY a.id
    ORDER BY risk_score DESC
    LIMIT 20
  `;
  const result = await query(sql);
  return result.rows;
};

module.exports = { getMetrics, getAlerts, getEventTrend, getThreatBreakdown, getTopRiskAssets };
