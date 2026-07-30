import { getTodos } from "../actions";
import { TodoForm, TodoItem } from "../components";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          TODO List
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {todos.length} {todos.length === 1 ? "item" : "items"}
        </p>
      </div>
      <TodoForm />
      {todos.length > 0 ? (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-zinc-400">
          No todos yet. Add one above!
        </p>
      )}
    </div>
  );
}
