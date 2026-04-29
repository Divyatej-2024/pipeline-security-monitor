# PipeSentinel (Pipeline Security Monitor)

PipeSentinel is a production-style SOC monitoring platform for CI/CD and runtime pipeline telemetry. It ingests security events, detects attack behaviors, scores risk, prioritizes alerts, and exposes dashboard/report APIs for analyst workflows.

## Business Context

Modern delivery pipelines are a high-value attack surface. PipeSentinel helps security teams:
- Detect credential abuse and brute-force patterns early.
- Identify reconnaissance activity such as port scans before exploitation.
- Prioritize high-impact incidents using risk scoring, not raw event volume.
- Track organization-wide risk posture and event trends for operations and reporting.

## Architecture

### Layers
1. Data ingestion: `POST /api/events` and `POST /api/events/batch`.
2. Detection engine: rule-based detection + anomaly spike detection.
3. Risk scoring: per-event score, IP-level aggregation, org-level aggregation.
4. API layer: dashboard, alerts, events, simulation, reset, and `/report`.
5. Frontend SOC dashboard: KPIs, trends, threat breakdown, priority tables.

### Data Flow
1. Event enters API and is schema validated.
2. Detection engine tags threat types (if any).
3. Risk engine calculates event score + cumulative IP score.
4. Alert prioritization assigns `Low/Medium/High/Critical` and color class.
5. Analytics service computes trends, top-risk IPs, and report insights.
6. Dashboard pulls `/api/dashboard` every 5 seconds.

## Folder Structure

```text
pipeline-security-monitor/
  api/
    [...path].js
  public/
    index.html
    styles.css
    app.js
  server/
    monitor.js
    core/
      config.js
      validation.js
      detection.js
      risk.js
      analytics.js
      store.js
    data/
      generator.js
  index.js
  vercel.json
  package.json
```

## Event Model

```json
{
  "ipAddress": "203.0.113.4",
  "eventType": "failed_login",
  "timestamp": "2026-04-29T12:30:00.000Z"
}
```

Supported `eventType` values:
- `failed_login`
- `port_scan`
- `suspicious_traffic`

Optional fields: `port`, `bytes`, `protocol`, `sourceSystem`.

## Detection + Scoring

Base score model:
- Failed login: `+20`
- Port scan: `+40`
- Suspicious traffic: `+60`

Detection logic:
- Brute force: repeated failed logins from same IP in 10 minutes.
- Active port scan: high unique-port activity in 3 minutes.
- Suspicious traffic cluster: repeated suspicious traffic in 5 minutes.
- Anomaly spike: threshold-based traffic burst from same IP.

Risk levels:
- Low
- Medium
- High
- Critical

## API Endpoints

- `GET /api/health`
- `POST /api/events`
- `POST /api/events/batch`
- `GET /api/events`
- `GET /api/alerts`
- `GET /api/dashboard`
- `POST /api/simulate` (generates 500-1000 realistic events)
- `POST /api/reset`
- `GET /report`

## Run Locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Sample Data

On startup, PipeSentinel auto-seeds ~800 events including:
- Coordinated failed-login bursts
- Port scan sequences
- Suspicious traffic clusters
- Benign background telemetry

This keeps the dashboard populated for demos and interviews.
