import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { TABLE_DDL } from "./ddl";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { max: 10, onnotice: () => {} });
export const db = drizzle(client, { schema });

let schemaReady: Promise<void> | null = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      for (const ddl of TABLE_DDL) {
        await client.unsafe(ddl);
      }
    })();
  }
  return schemaReady;
}
