// ============================================================================
// 【Next.js 知识点】Server Actions — 员工管理（含外键关联）
// ============================================================================
// 1. 标准 CRUD 模式，与 departments 相同
// 2. 本模块的知识点:
//    - departmentId 外键关联 departments 表，写入时传 null 表示"无部门"
//    - 服务端用 createLogger 记录结构化日志（比 console.log 更适合生产排查）
//    - 跨模块依赖: 员工列表页面需要部门列表填充下拉框（见 page.tsx）
// ============================================================================

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
