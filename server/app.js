const express = require("express");
const path = require("path");
const cors = require("cors");
const { env } = require("./config/env");
const { apiRouter } = require("./routes/apiRoutes");
const { requestLogger } = require("./middleware/requestLogger");
const { rateLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { pool } = require("./db/pool");

const buildApp = () => {
  const app = express();

  app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin }));
  app.use(express.json({ limit: env.maxBodyBytes }));
  app.use(requestLogger);
  app.use(rateLimiter);

  app.get("/health", async (req, res) => {
    let db = "disconnected";
    if (pool) {
      try {
        await pool.query("SELECT 1");
        db = "connected";
      } catch (error) {
        db = "error";
      }
    }
    res.json({ status: "ok", service: "PipeSentinel", db, timestamp: new Date().toISOString() });
  });

  app.use("/api", apiRouter);

  const frontendIndex = path.join(env.frontendDist, "index.html");
  app.use(express.static(env.frontendDist));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") return next();
    return res.sendFile(frontendIndex);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = { buildApp };
