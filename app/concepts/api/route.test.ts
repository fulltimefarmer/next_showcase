import { describe, it, expect, beforeEach, vi } from "vitest";import { GET, POST, DELETE } from "./route";
import { GET as getItemHandler, PUT, DELETE as DELETE_ITEM } from "./[id]/route";
import { clearItems } from "@/lib/concepts-store";

// mock next/headers —— headers()/cookies() 在单测环境无请求上下文
vi.mock("next/headers", () => ({
  headers: async () => new Map([["user-agent", "vitest-agent"]]),
  cookies: async () => ({
    get: () => ({ value: "test-visitor" }),
  }),
}));

// 构造最小 NextRequest 的辅助函数
// NextRequest 需要 nextUrl（Next.js 内部解析的 URL），这里模拟生成
function makeRequest(path: string, init?: { method?: string; body?: unknown }) {
  const url = new URL(`http://localhost${path}`);
  const req = new Request(url.toString(), {
    method: init?.method ?? "GET",
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
  });
  // 给纯 Request 挂上 nextUrl（含 searchParams）
  (req as unknown as Record<string, unknown>).nextUrl = url;
  return req as unknown as import("next/server").NextRequest;
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("Route Handlers /concepts/api", () => {
  beforeEach(() => {
    clearItems();
  });

  it("POST 创建新项并返回 201", async () => {
    const res = await POST(makeRequest("/concepts/api", { method: "POST", body: { name: "Test" } }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.name).toBe("Test");
    expect(json.id).toBe(1);
  });

  it("GET 返回列表（含 meta）", async () => {
    const res = await GET(makeRequest("/concepts/api"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toBeInstanceOf(Array);
    expect(json.items).toHaveLength(0);
    expect(json.meta).toBeDefined();
  });

  it("GET 支持 ?keyword= 过滤", async () => {
    await POST(makeRequest("/concepts/api", { method: "POST", body: { name: "Alpha" } }));
    await POST(makeRequest("/concepts/api", { method: "POST", body: { name: "Beta" } }));
    const res = await GET(makeRequest("/concepts/api?keyword=al"));
    const json = await res.json();
    expect(json.items).toHaveLength(1);
    expect(json.items[0].name).toBe("Alpha");
  });

  it("DELETE 清空列表", async () => {
    await POST(makeRequest("/concepts/api", { method: "POST", body: { name: "A" } }));
    const res = await DELETE();
    const json = await res.json();
    expect(json.cleared).toBe(true);
    const list = await GET(makeRequest("/concepts/api")).then((r) => r.json());
    expect(list.items).toHaveLength(0);
  });
});

describe("Route Handlers /concepts/api/[id]", () => {
  it("GET /:id 返回存在的项", async () => {
    const created = await POST(makeRequest("/concepts/api", { method: "POST", body: { name: "Alpha" } })).then((r) => r.json());
    const res = await getItemHandler(makeRequest("/concepts/api/1"), ctx(String(created.id)));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe("Alpha");
  });

  it("GET /:id 不存在返回 404", async () => {
    const res = await getItemHandler(makeRequest("/concepts/api/999"), ctx("999"));
    expect(res.status).toBe(404);
  });

  it("PUT /:id 更新名字", async () => {
    const created = await POST(makeRequest("/concepts/api", { method: "POST", body: { name: "Alpha" } })).then((r) => r.json());
    const res = await PUT(makeRequest(`/concepts/api/${created.id}`, { method: "PUT", body: { name: "Alpha v2" } }), ctx(String(created.id)));
    const json = await res.json();
    expect(json.name).toBe("Alpha v2");
  });

  it("PUT /:id 不存在返回 404", async () => {
    const res = await PUT(makeRequest("/concepts/api/999", { method: "PUT", body: { name: "x" } }), ctx("999"));
    expect(res.status).toBe(404);
  });

  it("DELETE /:id 删除项", async () => {
    const created = await POST(makeRequest("/concepts/api", { method: "POST", body: { name: "Alpha" } })).then((r) => r.json());
    const res = await DELETE_ITEM(makeRequest("/concepts/api/1"), ctx(String(created.id)));
    expect(res.status).toBe(200);
  });

  it("DELETE /:id 不存在返回 404", async () => {
    const res = await DELETE_ITEM(makeRequest("/concepts/api/999"), ctx("999"));
    expect(res.status).toBe(404);
  });
});
