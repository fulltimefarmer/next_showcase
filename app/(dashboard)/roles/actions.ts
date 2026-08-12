"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { log } from "@/lib/audit";

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
