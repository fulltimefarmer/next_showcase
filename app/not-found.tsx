// ============================================================================
// 【Next.js 知识点 · 新增案例】not-found.tsx — 全局 404 页面
// ============================================================================
// 1. 放在 app/ 根目录的 not-found.tsx 是「全局 404」：
//    访问任何未匹配的 URL 都会渲染它
// 2. 与 app/concepts/not-found/[id]/not-found.tsx 的区别：
//    - 根目录 = 全局兜底
//    - 路由段内 = 该段专属（优先级更高，就近原则）
// 3. 注意：全局 not-found.tsx 也需要处理「根布局」场景，
//    因为它可能在根布局之外渲染（此处简化，无特殊布局）
// ============================================================================

import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 text-center">
      <p className="mb-2 text-6xl font-bold text-slate-300">404</p>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">
        页面不存在 / Page Not Found
      </h1>
      <p className="mb-4 text-sm text-slate-500">
        访问的 URL 没有匹配到任何路由（全局 404 页面）。
      </p>
      <Link
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        返回首页
      </Link>
    </div>
  );
}
