// ============================================================================
// 【Next.js 知识点 · 新增案例】Route Handlers — 完整 CRUD API
// ============================================================================
// 1. route.ts 是 API 端点，导出 HTTP 方法函数：GET / POST / PUT / DELETE 等
//    - 类比 Spring 的 @RestController
// 2. request.nextUrl.searchParams 读取查询参数（?keyword=xxx）
// 3. headers() / cookies() 来自 next/headers，只能在服务端使用，
//    读取请求头与 Cookie（注意 Next 15+ 返回 Promise，需 await）
// 4. 数据来自 lib/concepts-store.ts 的内存 store（演示用）
// ============================================================================

import { NextRequest } from "next/server";
import { headers, cookies } from "next/headers";
import { listItems, addItem, clearItems } from "@/lib/concepts-store";

// GET /concepts/api?keyword=xxx
// 读取查询参数 + 请求头 + Cookie
export async function GET(request: NextRequest) {
  // 【查询参数】读取 ?keyword= 进行过滤
  const keyword = request.nextUrl.searchParams.get("keyword") ?? "";

  // 【headers】读取请求头（如 User-Agent）
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");

  // 【cookies】读取 Cookie
  const cookieStore = await cookies();
  const visitor = cookieStore.get("visitor")?.value ?? "unknown";

  return Response.json({
    items: listItems(keyword),
    meta: { userAgent: userAgent?.slice(0, 40), visitor },
  });
}

// POST /concepts/api   —— body 为 JSON { name: string }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const item = addItem(body.name ?? `Item ${Date.now()}`);

  // 设置一个 Cookie 演示（响应中携带 Set-Cookie）
  const response = Response.json(item, { status: 201 });
  response.headers.set("Set-Cookie", `visitor=created-${item.id}; Path=/`);
  return response;
}

// DELETE /concepts/api   —— 清空列表（演示批量删除）
export async function DELETE() {
  clearItems();
  return Response.json({ ok: true, cleared: true });
}
