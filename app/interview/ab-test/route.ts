// ============================================================================
// 【Next.js 知识点】A/B 测试 — Route Handler 设置变体 Cookie
// ============================================================================
// 1. 生产环境通常在 middleware 按比例分发变体并写入 Cookie（本 demo 用 POST 手动切换）
// 2. 这里演示 NextResponse.cookies.set 设置变体 Cookie，页面读取后渲染不同 UI
// ============================================================================

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { variant?: string };
  const variant = body.variant === "b" ? "b" : "a";

  const res = NextResponse.json({ ok: true, variant });
  res.cookies.set("ab_variant", variant, { path: "/", maxAge: 60 * 60 * 24 });
  return res;
}
