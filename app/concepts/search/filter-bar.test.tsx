import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterBar } from "./filter-bar";

// mock next/navigation 的 useSearchParams
const mockGet = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: mockGet }),
}));

describe("FilterBar 客户端组件", () => {
  it("无筛选参数时 All 高亮", () => {
    mockGet.mockReturnValue(null);
    render(<FilterBar />);
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("根据当前 status 参数高亮对应按钮", () => {
    mockGet.mockReturnValue("active");
    render(<FilterBar />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("渲染所有状态筛选按钮", () => {
    mockGet.mockReturnValue(null);
    render(<FilterBar />);
    expect(screen.getByText("inactive")).toBeInTheDocument();
    expect(screen.getByText("maintenance")).toBeInTheDocument();
  });
});
