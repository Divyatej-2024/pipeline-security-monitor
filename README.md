# PipeSentinel

## Architecture Diagram

[External Sensors/CI Hooks]
    -> HTTPS POST /api/ingest (API key + validation + rate limit)
        -> Ingestion Service
            -> Detection Service (brute force, port scanning, behavior anomaly)
            -> Scoring Service (weights + time decay + risk level)
            -> PostgreSQL (events, assets, alerts)
            -> Analytics Service (metrics/trends/breakdown/top assets)
            -> Socket.IO Broadcast (soc:update)
                -> React SOC Dashboard (multi-client live sync)

[Background Worker]
    -> synthetic event generation loop
    -> uses same ingestion pipeline and persistence

## Data Flow

1. Incoming event is authenticated and validated.
2. Event is processed through detection and scoring.
3. Event and related alerts are persisted in PostgreSQL.
4. Aggregated analytics are recalculated through SQL queries.
5. Socket layer broadcasts delta updates to connected clients.
6. Dashboard merges live updates and periodic API refreshes.

## Core Endpoints

- GET /health
- GET /api/metrics
- GET /api/alerts
- GET /api/events/trend
- GET /api/threats/breakdown
- GET /api/assets/top-risks
- POST /api/alerts/:id/acknowledge
- POST /api/ingest

## Environment Variables

Backend:
- PORT=3000
- NODE_ENV=development
- DATABASE_URL=postgres://user:pass@host:5432/pipesentinel
- INGESTION_API_KEY=replace-with-secure-key
- CORS_ORIGIN=http://localhost:5173
- RATE_LIMIT_WINDOW_MS=60000
- RATE_LIMIT_MAX=120
- WORKER_INTERVAL_MS=5000

Frontend:
- VITE_API_BASE_URL=http://localhost:3000

## Database Setup

Run SQL scripts in order:
1. db/schema.sql
2. db/seed.sql

## Deploy

Backend (Render/Railway):
- Deploy root service with `npm start`.
- Provision PostgreSQL and set `DATABASE_URL`.
- Set `INGESTION_API_KEY`, `CORS_ORIGIN`, and rate-limit envs.

Frontend (Vercel):
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Env: `VITE_API_BASE_URL=https://<backend-host>`

## Local Run

Terminal 1:
- npm install
- npm start

Terminal 2:
- cd frontend
- npm install
- npm run dev

Open http://localhost:5173
