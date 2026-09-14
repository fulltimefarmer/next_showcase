"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { log } from "@/lib/audit";

// ============================================================================
// 【Next.js 知识点】Server Actions — 角色权限管理 (RBAC)
// ============================================================================
// 1. permissions 字段是 JSONB 数组，直接存字符串权限项
//    - 例如 ["departments:read", "employees:write"]
//    - 相比多表关联更简单，适合权限项数量适中的场景
// 2. 每个写操作记录审计日志（谁、做了什么、改了哪些权限）
// 3. 页面级权限控制: 只有 admin 角色能访问本页面（见 page.tsx）
// ============================================================================

export async function getRoles() {
  await ensureSchema();
  return db.select().from(roles).orderBy(roles.name);
}

export async function createRole(data: {
  name: string;
  description?: string;
  permissions: string[];
}) {
  await ensureSchema();
  const result = await db
    .insert(roles)
    .values({
      name: data.name,
      description: data.description || null,
      permissions: data.permissions,
    })
    .returning({ id: roles.id });
  await log("create", "role", result[0]?.id, {
    name: data.name,
    permissions: data.permissions,
  });
  revalidatePath("/roles");
}

export async function updateRole(
  id: number,
  data: {
    name: string;
    description?: string;
    permissions: string[];
  }
) {
  await ensureSchema();
  await db
    .update(roles)
    .set({
      name: data.name,
      description: data.description || null,
      permissions: data.permissions,
    })
    .where(eq(roles.id, id));
  await log("update", "role", id, {
    name: data.name,
    permissions: data.permissions,
  });
  revalidatePath("/roles");
}

export async function deleteRole(id: number) {
  await ensureSchema();
  await db.delete(roles).where(eq(roles.id, id));
  await log("delete", "role", id);
  revalidatePath("/roles");
}
