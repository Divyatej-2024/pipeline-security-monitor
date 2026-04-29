const http = require("http");
const { buildApp } = require("./server/app");
const { env } = require("./server/config/env");
const { setupSocketIo } = require("./server/sockets/setupSocketIo");
const { startIngestionWorker } = require("./server/workers/ingestionWorker");
const { logger } = require("./server/utils/logger");

const app = buildApp();
const server = http.createServer(app);
setupSocketIo(server, env.corsOrigin);

server.listen(env.port, () => {
  logger.info("pipesentinel_started", { port: env.port, environment: env.nodeEnv });
  if (env.databaseUrl) {
    startIngestionWorker();
  } else {
    logger.warn("worker_disabled", { reason: "DATABASE_URL is not configured" });
  }
});
