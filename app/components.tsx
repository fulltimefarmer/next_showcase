"use client";

import { useState } from "react";
import { createTodo, deleteTodo, updateTodo } from "@/app/actions";
import type { Todo } from "@/app/db/types";

export function TodoForm() {
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    await createTodo({ title: title.trim() });
    setTitle("");
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending || !title.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

export function TodoItem({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [pending, setPending] = useState(false);

  async function toggleComplete() {
    setPending(true);
    await updateTodo(todo.id, { completed: !todo.completed });
    setPending(false);
  }

  async function handleSave() {
    if (!editTitle.trim()) return;
    setPending(true);
    await updateTodo(todo.id, { title: editTitle.trim() });
    setEditing(false);
    setPending(false);
  }

  async function handleDelete() {
    setPending(true);
    await deleteTodo(todo.id);
    setPending(false);
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditTitle(todo.title);
      setEditing(false);
    }
  }

  return (
    <li className="group flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={toggleComplete}
        disabled={pending}
        className="size-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
      />
      {editing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 text-sm ${todo.completed ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"}`}
        >
          {todo.title}
        </span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            setEditTitle(todo.title);
            setEditing(true);
          }}
          disabled={pending}
          className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
