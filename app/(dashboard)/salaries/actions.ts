"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { salaries, employees } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { log } from "@/lib/audit";

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
