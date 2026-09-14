// ============================================================================
// 【Next.js 知识点】Server Actions — 审计日志（只读）
// ============================================================================
// 1. 纯只读查询，没有写操作，因此不需要 revalidatePath
// 2. 审计日志由其它模块的 Server Action 通过 lib/audit 的 log() 自动写入
// 3. 本模块演示了"读多写少"场景：只负责展示，不负责产生数据
// ============================================================================

"use server";

import { db, ensureSchema } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getAuditLogs() {
  await ensureSchema();
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
}
