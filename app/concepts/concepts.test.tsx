import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ConceptsPage from "./page";

describe("Concepts 总览页", () => {
  it("渲染所有知识点的标题", async () => {
    render(await ConceptsPage());
    expect(screen.getByText("Next.js 补充学习案例 / Missing-concept Demos")).toBeInTheDocument();
    expect(screen.getByText("loading.tsx + Suspense")).toBeInTheDocument();
    expect(screen.getByText("error.tsx 错误边界")).toBeInTheDocument();
    expect(screen.getByText("not-found.tsx + notFound()")).toBeInTheDocument();
    expect(screen.getByText("generateMetadata 动态 SEO")).toBeInTheDocument();
    expect(screen.getByText("ISR (revalidate)")).toBeInTheDocument();
    expect(screen.getByText("useOptimistic 乐观更新")).toBeInTheDocument();
  });
});
