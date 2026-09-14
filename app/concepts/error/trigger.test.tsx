import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorTrigger } from "./trigger";

// React 在抛错时会 console.error，这里静音避免噪音
const originalError = console.error;

describe("ErrorTrigger 客户端组件", () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  it("渲染抛错按钮和计数", () => {
    render(<ErrorTrigger />);
    expect(screen.getByText(/触发错误边界/)).toBeInTheDocument();
    expect(screen.getByText(/正常内容不受影响，计数：0/)).toBeInTheDocument();
  });

  it("点击 +1 计数递增", () => {
    render(<ErrorTrigger />);
    fireEvent.click(screen.getByRole("button", { name: "+1" }));
    expect(screen.getByText(/计数：1/)).toBeInTheDocument();
  });

  afterEach(() => {
    console.error = originalError;
  });
});
