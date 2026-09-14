// ============================================================================
// 【Next.js 知识点 · 新增案例】not-found.tsx — 路由段专属 404 页面
// ============================================================================
// 1. 这个文件位于 [id] 目录下，只对 /concepts/not-found/[id] 生效
// 2. notFound() 触发后，Next.js 从「最近的路由段」向上查找 not-found.tsx
// 3. 若在 app/ 根目录也放一个 not-found.tsx，则成为全局 404（未被匹配的 URL）
// ============================================================================

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <p className="mb-2 text-6xl font-bold text-slate-300">404</p>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">
        Resource Not Found
      </h1>
      <p className="mb-4 text-sm text-slate-500">
        该资源不存在（notFound() 主动返回的 404）。
      </p>
      <Link
        href="/concepts/not-found"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        返回列表
      </Link>
    </div>
  );
}
