import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SlowContentPage from "./page";
import { SlowContent } from "./slow-content";

describe("SlowContent 服务端组件", () => {
  it("等待后渲染内容", async () => {
    // 服务端组件（async）可用 render + findBy 等待异步完成
    render(await SlowContent({ label: "测试" }));
    expect(screen.getByText(/测试 加载完成/)).toBeInTheDocument();
  });
});

describe("LoadingDemo 页面", () => {
  it("渲染标题和快内容", async () => {
    render(await SlowContentPage());
    expect(screen.getByText(/loading.tsx \+ Suspense 流式渲染/)).toBeInTheDocument();
    expect(screen.getByText(/这段「快内容」立即渲染/)).toBeInTheDocument();
  });
});
