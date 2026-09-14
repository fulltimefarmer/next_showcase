// ============================================================================
// 【Next.js 知识点】Interview Layout — 面试题演示区导航
// ============================================================================
// 这是独立于 (dashboard) 和 concepts 的「面试题演示区」，
// 用于集中演示 INTERVIEW_QA.md 中「高级篇」那些项目原本没有覆盖的技术点。
// 每个案例都是独立子页面，可点击左侧导航逐一体验。
// ============================================================================

import Link from "next/link";

const cases = [
  { href: "/interview", label: "Overview / 总览" },
  { href: "/interview/revalidate-tag", label: "revalidateTag 标签失效" },
  { href: "/interview/server-validation", label: "服务端 Zod 校验" },
  { href: "/interview/pagination", label: "searchParams 分页" },
  { href: "/interview/transactions", label: "Drizzle 事务" },
  { href: "/interview/optimistic-concurrency", label: "乐观锁并发控制" },
  { href: "/interview/sse", label: "SSE 实时推送" },
  { href: "/interview/dynamic-import", label: "next/dynamic 代码分割" },
  { href: "/interview/react19", label: "useActionState + useFormStatus" },
  { href: "/interview/transition", label: "useTransition 非紧急更新" },
  { href: "/interview/ab-test", label: "A/B 测试（Cookie 分流）" },
  { href: "/interview/i18n", label: "简单 i18n 国际化" },
];

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
        <Link href="/interview" className="mb-4 block">
          <span className="text-sm font-semibold text-slate-900">
            面试题演示区
          </span>
          <span className="block text-xs text-slate-400">
            Interview demos
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
