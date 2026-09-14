// ============================================================================
// 【Next.js 知识点】Server Component — 页面级权限控制（与 roles 相同）
// ============================================================================
// 1. auth() 获取 session → 判断 role → 非 admin 则 redirect("/")
// 2. 这是三层权限控制的第二层（页面级），比 middleware 更灵活
//    - middleware 只能判断"是否登录"，这里能判断"具体角色"
// 3. 审计日志只读，适合演示"只有管理员可查看"的场景
// ============================================================================

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAuditLogs } from "./actions";
import { AuditLogList } from "./audit-log-list";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    redirect("/");
  }
  const data = await getAuditLogs();
  return <AuditLogList initialData={data} />;
}
