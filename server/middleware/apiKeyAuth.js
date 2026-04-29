const { env } = require("../config/env");

const requireIngestionApiKey = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== env.ingestionApiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  return next();
};

module.exports = { requireIngestionApiKey };
