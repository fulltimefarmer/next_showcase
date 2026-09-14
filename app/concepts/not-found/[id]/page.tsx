// ============================================================================
// 【Next.js 知识点 · 新增案例】动态参数 + notFound()
// ============================================================================
// 1. [id] 是动态路由段，通过 props.params.id 获取
// 2. 模拟「按 id 查资源」，找不到时调用 notFound() 返回 404
//    - 这比手动 return 一个"未找到"页面更符合语义，HTTP 状态码是 404
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";

// 模拟数据库中的资源列表
const RESOURCES = [
  { id: "1", name: "Resource Alpha" },
  { id: "2", name: "Resource Beta" },
];

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15+ 中 params 是 Promise，需要 await
  const { id } = await params;
  const resource = RESOURCES.find((r) => r.id === id);

  // 找不到资源 → 返回 404（渲染最近的 not-found.tsx）
  if (!resource) {
    notFound();
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">{resource.name}</h1>
      <p className="mb-4 text-sm text-slate-500">id = {resource.id}</p>
      <Link
        href="/concepts/not-found"
        className="text-sm text-blue-600 hover:underline"
      >
        ← 返回列表
      </Link>
    </div>
  );
}
