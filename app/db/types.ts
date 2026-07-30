export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export type CreateTodoInput = Pick<Todo, "title">;
export type UpdateTodoInput = Partial<Pick<Todo, "title" | "completed">>;
