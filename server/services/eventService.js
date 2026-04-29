const { query } = require("../db/pool");

const upsertAsset = async (assetId, sourceIp) => {
  const sql = `
    INSERT INTO assets (asset_id, hostname, ip_address, environment)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (asset_id)
    DO UPDATE SET ip_address = EXCLUDED.ip_address, updated_at = NOW()
    RETURNING id
  `;
  const result = await query(sql, [assetId, assetId, sourceIp, "production"]);
  return result.rows[0].id;
};

const insertEvent = async ({ sourceIp, assetId, eventType, metadata, occurredAt, riskScore }) => {
  const assetPk = await upsertAsset(assetId, sourceIp);

  const sql = `
    INSERT INTO events (asset_id, source_ip, event_type, metadata, risk_score, occurred_at)
    VALUES ($1, $2, $3, $4::jsonb, $5, $6)
    RETURNING *
  `;

  const params = [assetPk, sourceIp, eventType, JSON.stringify(metadata || {}), riskScore, occurredAt];
  const result = await query(sql, params);
  return result.rows[0];
};

module.exports = { insertEvent };
