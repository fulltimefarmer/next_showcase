"use server";

import { revalidatePath } from "next/cache";
import { pool, ensureSchema } from "./db";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "./db/types";

async function getClient() {
  await ensureSchema();
  return pool;
}

export async function getTodos(): Promise<Todo[]> {
  const db = await getClient();
  const result = await db.query<Todo>(
    "SELECT * FROM todos ORDER BY created_at DESC",
  );
  return result.rows;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const db = await getClient();
  const result = await db.query<Todo>(
    "INSERT INTO todos (title) VALUES ($1) RETURNING *",
    [input.title],
  );
  revalidatePath("/todos");
  return result.rows[0];
}

export async function updateTodo(
  id: number,
  input: UpdateTodoInput,
): Promise<Todo> {
  const db = await getClient();
  const sets: string[] = [];
  const values: (string | boolean | number)[] = [];
  let idx = 1;

  if (input.title !== undefined) {
    sets.push(`title = $${idx++}`);
    values.push(input.title);
  }
  if (input.completed !== undefined) {
    sets.push(`completed = $${idx++}`);
    values.push(input.completed);
  }
  sets.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query<Todo>(
    `UPDATE todos SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  revalidatePath("/todos");
  return result.rows[0];
}

export async function deleteTodo(id: number): Promise<void> {
  const db = await getClient();
  await db.query("DELETE FROM todos WHERE id = $1", [id]);
  revalidatePath("/todos");
}
