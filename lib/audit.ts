// ============================================================================
// 【Next.js 知识点】审计日志 — Server Action 中调用
// ============================================================================
// 1. 这也是一个 Server Action（"use server"）
// 2. 审计日志的设计原则: 不能影响主流程
//    - try/catch 包裹，失败静默处理
//    - 不 throw error，不阻塞业务逻辑
// 3. auth() 在 Server Action 中自动获取当前用户
//    - 不需要传参，Next.js 从 cookie 中读取 session
// ============================================================================

"use server";

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
