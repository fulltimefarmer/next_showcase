// ============================================================================
// 【Next.js 知识点 · 新增案例】Concepts 总览页
// ============================================================================
// 汇总本学习区补足的所有"项目原本缺失"的重要知识点，
// 每个案例都有独立子页面，可点击左侧导航逐一体验。
// ============================================================================

import Link from "next/link";

export default function ConceptsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Next.js 补充学习案例 / Missing-concept Demos
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        以下知识点是 Next.js 全栈开发中的高频必会项，但本项目原有业务模块没有覆盖，这里逐一补齐。
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "loading.tsx + Suspense",
            desc: "路由级加载态与组件级流式渲染（Streaming）：慢组件先显示 fallback，快内容先渲染。",
            path: "/concepts/loading",
          },
          {
            title: "error.tsx 错误边界",
            desc: "局部错误边界 + reset 重试按钮，错误只影响当前路由，不影响整站。",
            path: "/concepts/error",
          },
          {
            title: "not-found.tsx + notFound()",
            desc: "调用 notFound() 主动返回 404，配合自定义 not-found 页面。",
            path: "/concepts/not-found",
          },
          {
            title: "generateMetadata 动态 SEO",
            desc: "根据路由参数动态生成 <title>/<meta>，提升 SEO 与分享预览。",
            path: "/concepts/metadata/42",
          },
          {
            title: "ISR (revalidate)",
            desc: "export const revalidate = 10：静态页面按时间间隔后台重新生成，兼顾性能与新鲜度。",
            path: "/concepts/isr",
          },
          {
            title: "useSearchParams URL 筛选",
            desc: "用 URL 查询参数（?status=...）驱动列表筛选，状态可分享、可回退。",
            path: "/concepts/search",
          },
          {
            title: "useOptimistic 乐观更新",
            desc: "React 19 特性：提交表单立即更新 UI，服务端确认后替换为真实结果。",
            path: "/concepts/optimistic",
          },
          {
            title: "Route Handlers 完整 CRUD",
            desc: "route.ts 导出 GET/POST/PUT/DELETE + 动态 [id] 参数 + 读取 headers/cookies。",
            path: "/concepts/route-handlers",
          },
          {
            title: "next/image 图片优化",
            desc: "自动格式转换、懒加载、尺寸优化，需在 next.config 配置 remotePatterns。",
            path: "/concepts/image",
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
