"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { todos } from "@/lib/db/schema";

export async function getTodos() {
  await ensureSchema();
  return db.select().from(todos).orderBy(asc(todos.createdAt));
}

export async function addTodo(title: string) {
  await ensureSchema();
  await db.insert(todos).values({ title });
  revalidatePath("/");
}

export async function toggleTodo(id: number) {
  await ensureSchema();
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  if (!todo) return;
  await db
    .update(todos)
    .set({ completed: !todo.completed })
    .where(eq(todos.id, id));
  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  await ensureSchema();
  await db.delete(todos).where(eq(todos.id, id));
  revalidatePath("/");
}
