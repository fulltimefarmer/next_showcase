"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "@/lib/logger";

const logger = createLogger("employees/actions");

export async function getEmployees() {
  await ensureSchema();
  return db.select().from(employees).orderBy(employees.name);
}

export async function createEmployee(data: {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  departmentId?: number | null;
  hireDate?: string;
}) {
  await ensureSchema();
  await db.insert(employees).values({
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    position: data.position || null,
    departmentId: data.departmentId || null,
    hireDate: data.hireDate || null,
  });
  logger.info("创建员工", { name: data.name });
  revalidatePath("/employees");
}

export async function updateEmployee(
  id: number,
  data: {
    name: string;
    email?: string;
    phone?: string;
    position?: string;
    departmentId?: number | null;
    hireDate?: string;
  }
) {
  await ensureSchema();
  await db
    .update(employees)
    .set({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      position: data.position || null,
      departmentId: data.departmentId || null,
      hireDate: data.hireDate || null,
    })
    .where(eq(employees.id, id));
  logger.info("更新员工", { id, name: data.name });
  revalidatePath("/employees");
}

export async function deleteEmployee(id: number) {
  await ensureSchema();
  await db.delete(employees).where(eq(employees.id, id));
  logger.info("删除员工", { id });
  revalidatePath("/employees");
}
