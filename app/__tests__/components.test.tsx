import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm, TodoItem } from "../components";
import type { Todo } from "../db/types";

vi.mock("@/app/actions", () => ({
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

const { createTodo, updateTodo, deleteTodo } = await import(
  /* @vite-ignore */ "@/app/actions"
);

const sampleTodo: Todo = {
  id: 1,
  title: "Test todo",
  completed: false,
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-01"),
};

const completedTodo: Todo = { ...sampleTodo, id: 2, completed: true };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TodoForm", () => {
  it("renders input and add button", () => {
    render(<TodoForm />);

    expect(
      screen.getByPlaceholderText("What needs to be done?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("add button is disabled when input is empty", () => {
    render(<TodoForm />);

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("add button is enabled when input has text", async () => {
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.type(
      screen.getByPlaceholderText("What needs to be done?"),
      "New todo",
    );

    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
  });

  it("calls createTodo on submit and clears input", async () => {
    (createTodo as ReturnType<typeof vi.fn>).mockResolvedValueOnce(sampleTodo);
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.type(
      screen.getByPlaceholderText("What needs to be done?"),
      "New todo",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createTodo).toHaveBeenCalledWith({ title: "New todo" });
    });
    expect(
      screen.getByPlaceholderText("What needs to be done?"),
    ).toHaveValue("");
  });

  it("does not submit empty input", async () => {
    const user = userEvent.setup();
    render(<TodoForm />);

    const button = screen.getByRole("button", { name: "Add" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(createTodo).not.toHaveBeenCalled();
  });
});

describe("TodoItem", () => {
  it("renders todo title and checkbox", () => {
    render(<TodoItem todo={sampleTodo} />);

    expect(screen.getByText("Test todo")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders completed todo with strikethrough", () => {
    render(<TodoItem todo={completedTodo} />);

    expect(screen.getByText("Test todo")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("toggles completed on checkbox click", async () => {
    (updateTodo as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      completedTodo,
    );
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />);

    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(updateTodo).toHaveBeenCalledWith(1, { completed: true });
    });
  });

  it("calls deleteTodo on delete button click", async () => {
    (deleteTodo as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteTodo).toHaveBeenCalledWith(1);
    });
  });

  it("enters edit mode on double click", async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />);

    const title = screen.getByText("Test todo");
    await user.dblClick(title);

    const input = screen.getByDisplayValue("Test todo");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("saves edited title on enter", async () => {
    (updateTodo as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...sampleTodo,
      title: "Edited todo",
    });
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />);

    await user.dblClick(screen.getByText("Test todo"));
    const input = screen.getByDisplayValue("Test todo");
    await user.clear(input);
    await user.type(input, "Edited todo");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(updateTodo).toHaveBeenCalledWith(1, { title: "Edited todo" });
    });
  });

  it("cancels editing on escape", async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />);

    await user.dblClick(screen.getByText("Test todo"));
    const input = screen.getByDisplayValue("Test todo");
    await user.clear(input);
    await user.type(input, "Something else");
    await user.keyboard("{Escape}");

    expect(screen.getByText("Test todo")).toBeInTheDocument();
    expect(updateTodo).not.toHaveBeenCalled();
  });

  it("enters edit mode via Edit button", async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByDisplayValue("Test todo")).toBeInTheDocument();
  });
});
