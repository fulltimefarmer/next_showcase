import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchDemoPage from "./page";

// mock next/navigation —— page 中的 FilterBar 用到了 useSearchParams
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
}));

describe("SearchDemo 页面（服务端筛选）", () => {
  it("无 status 参数时显示全部", async () => {
    render(await SearchDemoPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/全部 \(all\)/)).toBeInTheDocument();
  });

  it("status=active 时只显示 active 项", async () => {
    render(await SearchDemoPage({ searchParams: Promise.resolve({ status: "active" }) }));
    expect(screen.getByText("Server A")).toBeInTheDocument();
    expect(screen.queryByText("Server C")).not.toBeInTheDocument();
  });

  it("status=maintenance 时只显示 maintenance 项", async () => {
    render(await SearchDemoPage({ searchParams: Promise.resolve({ status: "maintenance" }) }));
    expect(screen.getByText("Server D")).toBeInTheDocument();
    expect(screen.queryByText("Server A")).not.toBeInTheDocument();
  });
});
