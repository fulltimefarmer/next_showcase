import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundedResourcePage from "./[id]/page";

describe("not-found 动态资源页", () => {
  it("存在的资源正常渲染", async () => {
    render(await NotFoundedResourcePage({ params: Promise.resolve({ id: "1" }) }));
    expect(screen.getByText("Resource Alpha")).toBeInTheDocument();
  });

  it("不存在的资源会触发 notFound()（抛出 NEXT_NOT_FOUND）", async () => {
    await expect(
      NotFoundedResourcePage({ params: Promise.resolve({ id: "3" }) })
    ).rejects.toThrow();
  });
});
