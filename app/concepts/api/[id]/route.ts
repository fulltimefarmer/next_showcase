// ============================================================================
// 【Next.js 知识点】Route Handler — 动态参数 [id]
// ============================================================================
// 1. 目录名 [id] 表示动态路由段，通过 context.params.id 获取
// 2. Next.js 15+ 中 params 是 Promise，需要 await
// 3. 演示 GET 单个资源 / PUT 更新 / DELETE 删除
// ============================================================================

import { NextRequest } from "next/server";
import { getItem, updateItem, removeItem } from "@/lib/concepts-store";

type Ctx = { params: Promise<{ id: string }> };

// GET /concepts/api/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const item = getItem(Number(id));
  if (!item) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  return Response.json(item);
}

// PUT /concepts/api/:id   —— body 为 JSON { name: string }
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateItem(Number(id), body.name);
  if (!updated) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  return Response.json(updated);
}

// DELETE /concepts/api/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const removed = removeItem(Number(id));
  if (!removed) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  return Response.json(removed);
}
