const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || "",
  ingestionApiKey: process.env.INGESTION_API_KEY || "pipesentinel-dev-key",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  maxBodyBytes: process.env.MAX_BODY_BYTES || "1mb",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 120),
  workerIntervalMs: Number(process.env.WORKER_INTERVAL_MS || 5000),
  frontendDist: path.join(process.cwd(), "frontend", "dist"),
};

module.exports = { env };
