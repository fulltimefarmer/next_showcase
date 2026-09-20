"use client";

import { useState } from "react";
import { addTodo, deleteTodo, getTodos, toggleTodo } from "./actions";

type Todo = Awaited<ReturnType<typeof getTodos>>[number];

export function TodoList({ initialData }: { initialData: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialData);
  const [title, setTitle] = useState("");

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await addTodo(trimmed);
    setTitle("");
    setTodos(await getTodos());
  }

  async function handleToggle(id: number) {
    await toggleTodo(id);
    setTodos(await getTodos());
  }

  async function handleDelete(id: number) {
    await deleteTodo(id);
    setTodos(await getTodos());
  }

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Todo List</h1>
        <p className="mt-2 text-sm text-slate-500">
          {completedCount} of {todos.length} completed
        </p>
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <ul className="rounded-lg border border-slate-200 bg-white">
        {todos.length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-slate-400">
            No todos yet. Add one above.
          </li>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
                className="size-4 accent-blue-600"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-900"
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
