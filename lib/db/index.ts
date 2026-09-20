import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { TABLE_DDL } from "./ddl";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

export async function ensureSchema() {
  for (const ddl of TABLE_DDL) {
    await client.unsafe(ddl);
  }
}
