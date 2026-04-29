const { env } = require("../config/env");
const { buildSyntheticEvent } = require("./eventFactory");
const { ingestEvent } = require("../services/ingestionService");
const { logger } = require("../utils/logger");

let workerHandle;

const startIngestionWorker = () => {
  if (workerHandle) return;

  workerHandle = setInterval(async () => {
    try {
      const burstSize = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < burstSize; i += 1) {
        const syntheticEvent = buildSyntheticEvent();
        await ingestEvent(syntheticEvent);
      }
      logger.info("ingestion_worker_tick", { burstSize });
    } catch (error) {
      logger.error("ingestion_worker_error", { message: error.message });
    }
  }, env.workerIntervalMs);
};

const stopIngestionWorker = () => {
  if (!workerHandle) return;
  clearInterval(workerHandle);
  workerHandle = undefined;
};

module.exports = { startIngestionWorker, stopIngestionWorker };
