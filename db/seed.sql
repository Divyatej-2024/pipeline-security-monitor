INSERT INTO users (email, full_name, role)
VALUES
('soc-lead@pipesentinel.io', 'SOC Lead', 'admin'),
('analyst1@pipesentinel.io', 'Analyst One', 'analyst'),
('analyst2@pipesentinel.io', 'Analyst Two', 'analyst')
ON CONFLICT (email) DO NOTHING;

INSERT INTO assets (asset_id, hostname, ip_address, environment)
SELECT
  'asset-' || LPAD(gs::text, 3, '0'),
  'pipeline-node-' || gs,
  ('10.20.' || (gs % 200) || '.' || ((gs * 3) % 254 + 1))::inet,
  CASE WHEN gs % 3 = 0 THEN 'production' WHEN gs % 3 = 1 THEN 'staging' ELSE 'qa' END
FROM generate_series(1, 45) gs
ON CONFLICT (asset_id) DO NOTHING;

WITH seeded_events AS (
  INSERT INTO events (asset_id, source_ip, event_type, metadata, risk_score, occurred_at)
  SELECT
    a.id,
    ('172.16.' || (g % 200) || '.' || ((g * 7) % 254 + 1))::inet,
    CASE
      WHEN random() < 0.30 THEN 'failed_login'
      WHEN random() < 0.50 THEN 'port_scan'
      WHEN random() < 0.68 THEN 'suspicious_traffic'
      WHEN random() < 0.82 THEN 'policy_violation'
      WHEN random() < 0.93 THEN 'anomalous_login'
      ELSE 'malware_download'
    END,
    jsonb_build_object('port', (random() * 65535)::int, 'bytesOut', (random() * 800000)::int),
    (40 + random() * 750)::int,
    NOW() - ((g % 900) || ' minutes')::interval
  FROM generate_series(1, 1200) g
  JOIN assets a ON a.id = ((g % 45) + 1)
  RETURNING id, asset_id, source_ip, event_type, risk_score, occurred_at
)
INSERT INTO alerts (event_id, asset_id, source_ip, threat_type, priority, risk_score, status, created_at)
SELECT
  e.id,
  e.asset_id,
  e.source_ip,
  CASE
    WHEN e.event_type = 'failed_login' THEN 'brute_force'
    WHEN e.event_type = 'port_scan' THEN 'port_scanning'
    WHEN e.event_type = 'suspicious_traffic' THEN 'suspicious_traffic'
    WHEN e.event_type = 'malware_download' THEN 'malware_download'
    WHEN e.event_type = 'policy_violation' THEN 'policy_violation'
    ELSE 'behavior_anomaly'
  END,
  CASE
    WHEN e.risk_score >= 700 THEN 'critical'
    WHEN e.risk_score >= 420 THEN 'high'
    WHEN e.risk_score >= 220 THEN 'medium'
    ELSE 'low'
  END,
  e.risk_score,
  CASE WHEN random() < 0.18 THEN 'acknowledged' ELSE 'open' END,
  e.occurred_at
FROM seeded_events e;
