import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "./todo-list";
import { addTodo, deleteTodo, getTodos, toggleTodo } from "./actions";

vi.mock("./actions");

type Todo = Awaited<ReturnType<typeof getTodos>>[number];

let store: Todo[];

beforeEach(() => {
  store = [
    { id: 1, title: "Buy milk", completed: false, createdAt: new Date() },
    { id: 2, title: "Walk dog", completed: true, createdAt: new Date() },
  ];
  vi.mocked(getTodos).mockImplementation(async () => [...store]);
  vi.mocked(addTodo).mockImplementation(async (title: string) => {
    store.push({
      id: store.length + 1,
      title,
      completed: false,
      createdAt: new Date(),
    });
  });
  vi.mocked(toggleTodo).mockImplementation(async (id: number) => {
    const todo = store.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
  });
  vi.mocked(deleteTodo).mockImplementation(async (id: number) => {
    store = store.filter((t) => t.id !== id);
  });
});

describe("TodoList", () => {
  it("renders initial todos and completion count", () => {
    render(<TodoList initialData={store} />);
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 completed")).toBeInTheDocument();
  });

  it("adds a new todo", async () => {
    const user = userEvent.setup();
    render(<TodoList initialData={store} />);
    await user.type(
      screen.getByPlaceholderText("What needs to be done?"),
      "Write tests"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByText("Write tests")).toBeInTheDocument();
  });

  it("deletes a todo", async () => {
    const user = userEvent.setup();
    render(<TodoList initialData={store} />);
    const buttons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(buttons[0]);
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
  });
});
