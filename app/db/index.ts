import { Pool } from "pg";
import schema from "./schema";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "next_showcase",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let schemaEnsured = false;

async function ensureSchema() {
  if (schemaEnsured) return;
  const client = await pool.connect();
  try {
    await client.query(schema);
    schemaEnsured = true;
  } finally {
    client.release();
  }
}

export { pool, ensureSchema };
