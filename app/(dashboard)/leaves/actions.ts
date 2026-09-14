// ============================================================================
// 【Next.js 知识点】Server Actions — 请假审批工作流
// ============================================================================
// 1. JOIN 查询: leftJoin 关联 employees 和 leaveTypes
//    - 只 select 需要的字段（employeeName / leaveTypeName），避免全表返回
//    - 这是"视图模型"思路：返回给 UI 的数据已经是拼装好的，客户端无需再关联
// 2. 状态机: pending → approved / rejected
//    - 状态流转在 approveLeaveRequest / rejectLeaveRequest 中完成
// 3. .returning({ id }): 插入后立即拿到自增主键（用于写审计日志）
// 4. 审计日志: 每次写操作调用 lib/audit 的 log()，记录"谁做了什么"
// ============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { leaveRequests, leaveTypes, employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { log } from "@/lib/audit";

export async function getLeaveRequests() {
  await ensureSchema();
  // 【Next.js】Server Action 返回的数据会被序列化传给客户端组件
  // 这里用 JOIN 把员工名、请假类型名直接拼进结果，避免客户端再做二次关联
  return db
    .select({
      id: leaveRequests.id,
      employeeId: leaveRequests.employeeId,
      employeeName: employees.name,
      leaveTypeId: leaveRequests.leaveTypeId,
      leaveTypeName: leaveTypes.name,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      approvedBy: leaveRequests.approvedBy,
      createdAt: leaveRequests.createdAt,
    })
    .from(leaveRequests)
    .leftJoin(employees, eq(leaveRequests.employeeId, employees.id))
    .leftJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
    .orderBy(leaveRequests.createdAt);
}

export async function getLeaveTypes() {
  await ensureSchema();
  return db.select().from(leaveTypes).orderBy(leaveTypes.name);
}

export async function createLeaveRequest(data: {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  await ensureSchema();
  const result = await db
    .insert(leaveRequests)
    .values({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason || null,
      status: "pending",
    })
    .returning({ id: leaveRequests.id });
  // 【Next.js + 审计】.returning() 拿到新记录的自增 ID
  await log("create", "leave_request", result[0]?.id, {
    employeeId: data.employeeId,
    startDate: data.startDate,
    endDate: data.endDate,
  });
  revalidatePath("/leaves");
}

// 【状态机】pending → approved：批准时记录审批人 approvedBy
export async function approveLeaveRequest(id: number, approverId: number) {
  await ensureSchema();
  await db
    .update(leaveRequests)
    .set({ status: "approved", approvedBy: approverId })
    .where(eq(leaveRequests.id, id));
  await log("approve", "leave_request", id, { approverId });
  revalidatePath("/leaves");
}

export async function rejectLeaveRequest(id: number, approverId: number) {
  await ensureSchema();
  await db
    .update(leaveRequests)
    .set({ status: "rejected", approvedBy: approverId })
    .where(eq(leaveRequests.id, id));
  await log("reject", "leave_request", id, { approverId });
  revalidatePath("/leaves");
}

export async function deleteLeaveRequest(id: number) {
  await ensureSchema();
  await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
  await log("delete", "leave_request", id);
  revalidatePath("/leaves");
}
