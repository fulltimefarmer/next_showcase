// ============================================================================
// 【Next.js 知识点 · 新增案例】not-found.tsx + notFound()
// ============================================================================
// 1. notFound()：在 Server Component / Server Action 中主动返回 404
//    - 内部抛 NEXT_NOT_FOUND error，Next.js 捕获后渲染最近的 not-found.tsx
// 2. not-found.tsx：自定义 404 页面
//    - 放在 app/ 根目录 = 全局 404
//    - 放在某个路由段 = 该段专属 404（本文件即 /concepts/not-found/[id] 专属）
// 3. 与 error.tsx 的区别：not-found 是「资源不存在」，error 是「执行出错」
// ============================================================================

import Link from "next/link";

export default function NotFoundCasePage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        not-found.tsx + notFound()
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        下面 id=1、2 是存在的资源，id=3 会触发 notFound() 返回 404。
      </p>

      <div className="space-x-2">
        <Link
          href="/concepts/not-found/1"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          查看 id=1（存在）
        </Link>
        <Link
          href="/concepts/not-found/2"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          查看 id=2（存在）
        </Link>
        <Link
          href="/concepts/not-found/3"
          className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          查看 id=3（触发 404）
        </Link>
      </div>
    </div>
  );
}
