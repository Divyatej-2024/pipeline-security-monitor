# Pipeline Security Monitor

Pipeline Security Monitor is a lightweight, real-time monitoring service for pipeline and network security events. It ingests events, applies simple detection rules, and streams alerts to a live dashboard.

## What This Project Includes

- Event ingestion API (`POST /api/events`)
- Rule-based detections (failed logins, port scans, secret exposure)
- Live dashboard with Socket.IO
- Simple simulator for generating demo traffic

## Architecture

1. Ingest events via API
2. Run detections in-memory
3. Emit alerts and events over websockets
4. Visualize in a web dashboard

## Quick Start

```bash
npm install
npm run start
```

Open:

```
http://localhost:3000
```

## API

### Health

```
GET /api/health
```

### Ingest Event

```
POST /api/events
```

Example payload:

```json
{
  "source": "github-actions",
  "type": "auth",
  "severity": "medium",
  "message": "Failed login attempt",
  "ip": "203.0.113.10",
  "user": "build-bot",
  "outcome": "failed"
}
```

### Fetch Events

```
GET /api/events
```

### Fetch Alerts

```
GET /api/alerts
```

### Simulator

```
POST /api/simulate
```

Payload options:

```json
{ "scenario": "failed_login" }
{ "scenario": "port_scan" }
{ "scenario": "secret" }
```

## Dashboard

The dashboard lives in `public/` and updates live via polling:

- Event stream
- Alerts list
- Alert trend chart

The default refresh interval is 3 seconds.

## Configuration

Environment variables (optional):

- `PORT` (default `3000`)
- `ALERT_THRESHOLD` (default `5`)
- `ALERT_WINDOW_MS` (default `300000`)
- `MAX_EVENTS` (default `500`)

## Vercel Deployment

This project is Vercel-friendly and uses API polling instead of WebSockets.

1. Push this repository to GitHub.
2. In Vercel, click **New Project** and import the repo.
3. Framework preset: `Other`.
4. Build command: leave empty.
5. Output directory: leave empty.
6. Deploy.

Vercel will serve the dashboard from `public/` and route API requests to
`api/index.js`.

## Project Notes

- `secret.js` contains a tiny secret detector used by the `code` event rule.
- `webhook.js` is a minimal GitHub webhook listener if you want to connect CI events.
- `app/` is a demo service that can act as a monitored target.

## Example Curl

```bash
curl -X POST http://localhost:3000/api/events ^
  -H "Content-Type: application/json" ^
  -d "{\"source\":\"pipeline\",\"type\":\"network\",\"severity\":\"high\",\"message\":\"Port probe\",\"ip\":\"198.51.100.5\",\"port\":22}"
```

## License

MIT

## Author

Divya Tej Pendela
