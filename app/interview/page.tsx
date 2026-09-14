// ============================================================================
// 【Next.js 知识点】Interview 总览页
// ============================================================================
// 汇总「面试题演示区」覆盖的、项目原有业务模块未体现的高频技术点。
// 每个案例对应 INTERVIEW_QA.md 中的若干题目。
// ============================================================================

import Link from "next/link";

export default function InterviewPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        面试题演示区 / Interview Demos
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        以下技术点是 Next.js 全栈面试高频项，但项目原有业务模块未覆盖，这里逐一补齐。
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "revalidateTag 标签失效",
            desc: "unstable_cache + revalidateTag：按标签精细失效缓存，对比 revalidatePath 按路径失效。",
            path: "/interview/revalidate-tag",
          },
          {
            title: "服务端 Zod 校验",
            desc: "客户端校验可被绕过，服务端必须复用同一 Zod schema 二次校验（安全底线）。",
            path: "/interview/server-validation",
          },
          {
            title: "searchParams 分页",
            desc: "用 URL 查询参数 ?page= 驱动分页，复用 lib/pagination.ts，状态可分享可回退。",
            path: "/interview/pagination",
          },
          {
            title: "Drizzle 事务",
            desc: "db.transaction 原子性：中途失败自动回滚（all-or-nothing）。",
            path: "/interview/transactions",
          },
          {
            title: "乐观锁并发控制",
            desc: "版本号 version 乐观锁：更新时校验版本，冲突则提示重试。",
            path: "/interview/optimistic-concurrency",
          },
          {
            title: "SSE 实时推送",
            desc: "Route Handler 返回 text/event-stream，客户端 EventSource 接收流式数据。",
            path: "/interview/sse",
          },
          {
            title: "next/dynamic 代码分割",
            desc: "动态导入大组件，配合 loading 与 ssr:false 拆分首屏 JS。",
            path: "/interview/dynamic-import",
          },
          {
            title: "useActionState + useFormStatus",
            desc: "React 19 表单状态管理：action 返回值 + 提交中状态（无需 props 钻取）。",
            path: "/interview/react19",
          },
          {
            title: "useTransition 非紧急更新",
            desc: "把慢更新标记为非紧急，保证输入等交互不被卡顿。",
            path: "/interview/transition",
          },
          {
            title: "A/B 测试（Cookie 分流）",
            desc: "基于 Cookie 的变体分发思路，展示服务端读取变体并渲染不同 UI。",
            path: "/interview/ab-test",
          },
          {
            title: "简单 i18n 国际化",
            desc: "用 [locale] 动态路由段 + 翻译字典演示国际化（无外部依赖）。",
            path: "/interview/i18n",
          },
        ].map((c) => (
          <Link
            key={c.path}
            href={c.path}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <h2 className="mb-1 text-base font-semibold text-slate-900">
              {c.title}
            </h2>
            <p className="text-sm text-slate-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
