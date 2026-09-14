"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { salaries, employees } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { log } from "@/lib/audit";

// ============================================================================
// 【Next.js 知识点】Server Actions — 薪资管理（服务端计算 + 状态机）
// ============================================================================
// 1. 服务端计算派生字段: actualPayment = baseSalary + bonus - deductions
//    - 业务规则放在服务端计算，保证数据一致性（前端只做实时预览）
//    - 客户端 salary-list.tsx 用 form.watch() 做同样的公式实时预览
// 2. 状态机: draft → paid（paySalary 同时写入 paidDate）
// 3. leftJoin + desc 排序：薪资按周期倒序，最新在前
// ============================================================================

export async function getSalaries() {
  await ensureSchema();
  return db
    .select({
      id: salaries.id,
      employeeId: salaries.employeeId,
      employeeName: employees.name,
      payPeriod: salaries.payPeriod,
      baseSalary: salaries.baseSalary,
      bonus: salaries.bonus,
      deductions: salaries.deductions,
      actualPayment: salaries.actualPayment,
      status: salaries.status,
      paidDate: salaries.paidDate,
      remarks: salaries.remarks,
      createdAt: salaries.createdAt,
    })
    .from(salaries)
    .leftJoin(employees, eq(salaries.employeeId, employees.id))
    .orderBy(desc(salaries.payPeriod));
}

export async function createSalary(data: {
  employeeId: number;
  payPeriod: string;
  baseSalary: number;
  bonus?: number;
  deductions?: number;
  remarks?: string;
}) {
  await ensureSchema();
  const bonus = data.bonus || 0;
  const deductions = data.deductions || 0;
  // 【服务端计算】实发金额 = 基本工资 + 奖金 - 扣款
  // 计算逻辑在服务端统一，前端只做预览，最终以入库为准
  const actualPayment = data.baseSalary + bonus - deductions;
  const result = await db
    .insert(salaries)
    .values({
      employeeId: data.employeeId,
      payPeriod: data.payPeriod,
      baseSalary: data.baseSalary,
      bonus,
      deductions,
      actualPayment,
      status: "draft",
      remarks: data.remarks || null,
    })
    .returning({ id: salaries.id });
  await log("create", "salary", result[0]?.id, {
    employeeId: data.employeeId,
    payPeriod: data.payPeriod,
  });
  revalidatePath("/salaries");
}

export async function updateSalary(
  id: number,
  data: {
    baseSalary: number;
    bonus?: number;
    deductions?: number;
    remarks?: string;
  }
) {
  await ensureSchema();
  const bonus = data.bonus || 0;
  const deductions = data.deductions || 0;
  const actualPayment = data.baseSalary + bonus - deductions;
  await db
    .update(salaries)
    .set({
      baseSalary: data.baseSalary,
      bonus,
      deductions,
      actualPayment,
      remarks: data.remarks || null,
    })
    .where(eq(salaries.id, id));
  await log("update", "salary", id, {
    baseSalary: data.baseSalary,
    actualPayment,
  });
  revalidatePath("/salaries");
}

// 【状态机】draft → paid：发放时写入当天日期
export async function paySalary(id: number) {
  await ensureSchema();
  await db
    .update(salaries)
    .set({ status: "paid", paidDate: new Date().toISOString().split("T")[0] })
    .where(eq(salaries.id, id));
  await log("approve", "salary", id, { action: "pay" });
  revalidatePath("/salaries");
}

export async function deleteSalary(id: number) {
  await ensureSchema();
  await db.delete(salaries).where(eq(salaries.id, id));
  await log("delete", "salary", id);
  revalidatePath("/salaries");
}
