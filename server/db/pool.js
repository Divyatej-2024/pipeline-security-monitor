const { Pool } = require("pg");
const { env } = require("../config/env");

let pool;

if (env.databaseUrl) {
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
  });
} else {
  pool = null;
}

const query = async (text, params = []) => {
  if (!pool) {
    throw new Error("DATABASE_URL is required for persistent mode");
  }
  return pool.query(text, params);
};

module.exports = { query, pool };
