const { env } = require("../config/env");

const counters = new Map();

const rateLimiter = (req, res, next) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const current = counters.get(key) || { count: 0, resetAt: now + env.rateLimitWindowMs };

  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + env.rateLimitWindowMs;
  }

  current.count += 1;
  counters.set(key, current);

  if (current.count > env.rateLimitMax) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  return next();
};

module.exports = { rateLimiter };
