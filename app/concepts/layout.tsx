// ============================================================================
// 【Next.js 知识点 · 新增案例】Concepts Layout — 学习区导航
// ============================================================================
// 这是独立于 (dashboard) 的学习区，集中演示项目原本缺失的重要知识点。
// 用 Link 列出所有案例，作为案例间的导航。
// ============================================================================

import Link from "next/link";

const cases = [
  { href: "/concepts", label: "Overview / 总览" },
  { href: "/concepts/loading", label: "loading.tsx + Suspense" },
  { href: "/concepts/error", label: "error.tsx 错误边界" },
  { href: "/concepts/not-found", label: "not-found.tsx + notFound()" },
  { href: "/concepts/metadata/42", label: "generateMetadata 动态 SEO" },
  { href: "/concepts/isr", label: "ISR (revalidate)" },
  { href: "/concepts/search", label: "useSearchParams 筛选" },
  { href: "/concepts/optimistic", label: "useOptimistic 乐观更新" },
  { href: "/concepts/route-handlers", label: "Route Handlers CRUD" },
  { href: "/concepts/image", label: "next/image 图片优化" },
];

export default function ConceptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
        <Link href="/concepts" className="mb-4 block">
          <span className="text-sm font-semibold text-slate-900">
            Next.js 补充案例
          </span>
          <span className="block text-xs text-slate-400">
            Missing-concept demos
          </span>
        </Link>
        <nav className="space-y-0.5">
          {cases.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block rounded-md px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
