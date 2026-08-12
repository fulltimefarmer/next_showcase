"use server";

import { db, ensureSchema } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getAuditLogs() {
  await ensureSchema();
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
}
