CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'analyst',
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id BIGSERIAL PRIMARY KEY,
  asset_id TEXT UNIQUE NOT NULL,
  hostname TEXT NOT NULL,
  ip_address INET NOT NULL,
  environment TEXT NOT NULL,
  owner_user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  source_ip INET NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_score INTEGER NOT NULL DEFAULT 0,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  source_ip INET NOT NULL,
  threat_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  acknowledged_by BIGINT REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_asset_id_occurred_at ON events(asset_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_alerts_priority_status_created ON alerts(priority, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_asset_id ON alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_ip ON assets(ip_address);
