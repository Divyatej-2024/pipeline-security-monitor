const { logger } = require("../utils/logger");

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

const errorHandler = (error, req, res, next) => {
  logger.error("unhandled_error", { message: error.message, stack: error.stack, path: req.originalUrl });
  res.status(error.status || 500).json({ error: "Internal server error" });
};

module.exports = { notFoundHandler, errorHandler };
