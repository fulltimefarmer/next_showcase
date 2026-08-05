"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getDepartments() {
  await ensureSchema();
  return db.select().from(departments).orderBy(departments.name);
}

export async function createDepartment(data: { name: string; description?: string }) {
  await ensureSchema();
  await db.insert(departments).values({
    name: data.name,
    description: data.description || null,
  });
  revalidatePath("/departments");
}

export async function updateDepartment(id: number, data: { name: string; description?: string }) {
  await ensureSchema();
  await db
    .update(departments)
    .set({ name: data.name, description: data.description || null })
    .where(eq(departments.id, id));
  revalidatePath("/departments");
}

export async function deleteDepartment(id: number) {
  await ensureSchema();
  await db.delete(departments).where(eq(departments.id, id));
  revalidatePath("/departments");
}
