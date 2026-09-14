// ============================================================================
// 【Next.js 知识点 · 新增案例】loading.tsx + Suspense 流式渲染 (Streaming)
// ============================================================================
// 1. 路由级 loading.tsx：页面是 async 且 await 数据时，切换导航期间显示全局加载态
// 2. 组件级 <Suspense>：把页面拆成小块，慢的部分先显示 fallback，
//    快的部分立即渲染 —— 这就是 App Router 的「流式渲染」核心
// 3. 对比传统 SSR：传统 SSR 要等所有数据就绪才返回 HTML；
//    Streaming 可以先返回页面骨架，再逐步推送慢组件内容
// ============================================================================

import { Suspense } from "react";
import { SlowContent } from "./slow-content";

export const dynamic = "force-dynamic";

// 一个轻量的骨架屏 fallback（对应 Java 里的「loading 占位」）
function Skeleton({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-400">
      <span className="animate-pulse">Loading {label}...</span>
    </div>
  );
}

export default function LoadingDemoPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        loading.tsx + Suspense 流式渲染
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        下面两块慢内容（各延迟 3 秒）会先显示骨架屏，其余内容立即渲染。观察首屏不阻塞。
      </p>

      {/* 快内容：立即显示 */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">
          这段「快内容」立即渲染，无需等待慢数据 —— 这就是 Streaming 的价值。
        </p>
      </div>

      {/* 慢内容 1：被 Suspense 包裹，先显示 fallback */}
      <div className="mb-6">
        <Suspense fallback={<Skeleton label="用户列表" />}>
          <SlowContent label="用户列表" />
        </Suspense>
      </div>

      {/* 慢内容 2：并行流式，互不阻塞 */}
      <div className="mb-6">
        <Suspense fallback={<Skeleton label="报表数据" />}>
          <SlowContent label="报表数据" />
        </Suspense>
      </div>
    </div>
  );
}
