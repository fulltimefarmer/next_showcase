import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();
const mockEnsureSchema = vi.fn().mockResolvedValue(undefined);
const mockRevalidatePath = vi.fn();

const mockPool = { query: mockQuery };

vi.mock("../db", () => ({
  pool: mockPool,
  ensureSchema: mockEnsureSchema,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

const { getTodos, createTodo, updateTodo, deleteTodo } =
  await import("../actions");

const sampleTodo = {
  id: 1,
  title: "Test todo",
  completed: false,
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTodos", () => {
  it("returns todos from database", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });

    const todos = await getTodos();

    expect(mockEnsureSchema).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * FROM todos ORDER BY created_at DESC",
    );
    expect(todos).toEqual([sampleTodo]);
  });

  it("returns empty array when no todos", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const todos = await getTodos();

    expect(todos).toEqual([]);
  });
});

describe("createTodo", () => {
  it("inserts a todo and revalidates", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });

    const todo = await createTodo({ title: "Test todo" });

    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO todos (title) VALUES ($1) RETURNING *",
      ["Test todo"],
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/todos");
    expect(todo).toEqual(sampleTodo);
  });
});

describe("updateTodo", () => {
  it("updates title", async () => {
    const updated = { ...sampleTodo, title: "Updated" };
    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const todo = await updateTodo(1, { title: "Updated" });

    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE todos SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      ["Updated", 1],
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/todos");
    expect(todo).toEqual(updated);
  });

  it("updates completed", async () => {
    const updated = { ...sampleTodo, completed: true };
    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const todo = await updateTodo(1, { completed: true });

    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE todos SET completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [true, 1],
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/todos");
    expect(todo).toEqual(updated);
  });

  it("updates both title and completed", async () => {
    const updated = { ...sampleTodo, title: "New", completed: true };
    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const todo = await updateTodo(1, { title: "New", completed: true });

    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE todos SET title = $1, completed = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      ["New", true, 1],
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/todos");
    expect(todo).toEqual(updated);
  });
});

describe("deleteTodo", () => {
  it("deletes a todo and revalidates", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await deleteTodo(42);

    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM todos WHERE id = $1",
      [42],
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/todos");
  });
});
