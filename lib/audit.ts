"use server";

/**
 * 审计日志工具
 *
 * 用法：
 *   await log("create", "department", 1, { name: "Engineering" });
 *
 * 会自动从 auth() 获取当前用户信息
 */

import { auth } from "@/lib/auth";
import { db, ensureSchema } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

type AuditAction = "create" | "update" | "delete" | "approve" | "reject";

export async function log(
  action: AuditAction,
  entity: string,
  entityId?: number,
  details?: Record<string, unknown>
) {
  try {
    const session = await auth();
    await ensureSchema();
    await db.insert(auditLogs).values({
      user: session?.user?.name || "unknown",
      action,
      entity,
      entityId: entityId ?? null,
      details: details ?? null,
    });
  } catch {
    // 审计日志不能影响主流程，静默失败
    console.error("[Audit] Failed to write audit log");
  }
}
