"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { performanceReviews, employees } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { log } from "@/lib/audit";

// ============================================================================
// 【Next.js 知识点】Server Actions — 绩效考核（多步骤工作流）
// ============================================================================
// 1. 状态机: draft → self_review → completed
//    - createReview 创建草稿
//    - submitSelfReview 员工自评（状态 → self_review）
//    - submitManagerReview 主管评分（状态 → completed，写入综合分）
// 2. categories 是 JSONB 字典 { "work_quality": 85, ... }
//    - 各维度评分随流程更新，无需为每个维度建列
// 3. 状态流转封装在 Server Action 中，客户端只负责"提交"和"刷新"
// ============================================================================

export async function getReviews() {
  await ensureSchema();
  return db
    .select({
      id: performanceReviews.id,
      employeeId: performanceReviews.employeeId,
      employeeName: employees.name,
      cycle: performanceReviews.cycle,
      categories: performanceReviews.categories,
      overallScore: performanceReviews.overallScore,
      selfScore: performanceReviews.selfScore,
      managerScore: performanceReviews.managerScore,
      status: performanceReviews.status,
      comments: performanceReviews.comments,
      createdAt: performanceReviews.createdAt,
    })
    .from(performanceReviews)
    .leftJoin(employees, eq(performanceReviews.employeeId, employees.id))
    .orderBy(desc(performanceReviews.cycle), desc(performanceReviews.createdAt));
}

export async function createReview(data: {
  employeeId: number;
  cycle: string;
  categories: Record<string, number>;
  status?: string;
  comments?: string;
}) {
  await ensureSchema();
  const result = await db
    .insert(performanceReviews)
    .values({
      employeeId: data.employeeId,
      cycle: data.cycle,
      categories: data.categories,
      overallScore: 0,
      selfScore: 0,
      managerScore: 0,
      status: data.status || "draft",
      comments: data.comments || null,
    })
    .returning({ id: performanceReviews.id });
  await log("create", "performance_review", result[0]?.id, {
    employeeId: data.employeeId,
    cycle: data.cycle,
  });
  revalidatePath("/performance");
}

/** 员工提交自评 — 状态: draft → self_review */
export async function submitSelfReview(
  id: number,
  data: { selfScore: number; categories: Record<string, number>; comments?: string }
) {
  await ensureSchema();
  await db
    .update(performanceReviews)
    .set({
      selfScore: data.selfScore,
      categories: data.categories,
      status: "self_review",
      comments: data.comments || null,
    })
    .where(eq(performanceReviews.id, id));
  await log("update", "performance_review", id, { action: "self_review" });
  revalidatePath("/performance");
}

/** 主管完成评分 — 状态: self_review → completed */
export async function submitManagerReview(
  id: number,
  data: {
    managerScore: number;
    categories: Record<string, number>;
    overallScore: number;
    comments?: string;
  }
) {
  await ensureSchema();
  await db
    .update(performanceReviews)
    .set({
      managerScore: data.managerScore,
      categories: data.categories,
      overallScore: data.overallScore,
      status: "completed",
      comments: data.comments || null,
    })
    .where(eq(performanceReviews.id, id));
  await log("approve", "performance_review", id, { action: "manager_review" });
  revalidatePath("/performance");
}

export async function deleteReview(id: number) {
  await ensureSchema();
  await db.delete(performanceReviews).where(eq(performanceReviews.id, id));
  await log("delete", "performance_review", id);
  revalidatePath("/performance");
}
