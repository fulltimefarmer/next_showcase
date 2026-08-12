"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { leaveRequests, leaveTypes, employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { log } from "@/lib/audit";

export async function getLeaveRequests() {
  await ensureSchema();
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
  await log("create", "leave_request", result[0]?.id, {
    employeeId: data.employeeId,
    startDate: data.startDate,
    endDate: data.endDate,
  });
  revalidatePath("/leaves");
}

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
