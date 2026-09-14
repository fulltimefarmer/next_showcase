// ============================================================================
// 【Next.js 知识点】useSearchParams — 客户端读取查询参数
// ============================================================================
// 1. useSearchParams() 只能在客户端组件中使用
// 2. 使用它的组件在静态渲染时需要包一层 <Suspense>，否则 build 报错
//    （因为 useSearchParams 依赖运行时 URL，构建时无法预知）
// 3. 本组件读取当前 ?status= 参数，并用 Link 生成带/不带参数的链接
// ============================================================================

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const STATUSES = ["active", "inactive", "maintenance"];

export function FilterBar() {
  // 客户端读取当前查询参数
  const searchParams = useSearchParams();
  const current = searchParams.get("status");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/concepts/search"
        className={`rounded-md px-3 py-1.5 text-sm transition ${
          !current
            ? "bg-blue-600 text-white"
            : "border border-slate-300 text-slate-700 hover:bg-slate-50"
        }`}
      >
        All
      </Link>
      {STATUSES.map((s) => (
        <Link
          key={s}
          href={`/concepts/search?status=${s}`}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            current === s
              ? "bg-blue-600 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {s}
        </Link>
      ))}
    </div>
  );
}
