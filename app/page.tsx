import { getTodos } from "./actions";
import { TodoList } from "./todo-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const todos = await getTodos();
  return <TodoList initialData={todos} />;
}
