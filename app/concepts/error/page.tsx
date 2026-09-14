// ============================================================================
// 【Next.js 知识点 · 新增案例】错误边界演示页
// ============================================================================
// 说明：
// 1. error.tsx 捕获的是「渲染/加载过程中的错误」，点击按钮抛错即可触发
// 2. 点击 reset 按钮会重新渲染本路由（ErrorTrigger 的状态会被重置）
// ============================================================================

import { ErrorTrigger } from "./trigger";

export default function ErrorDemoPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        error.tsx 错误边界
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        局部错误边界 + reset 重试。错误只影响本路由，站点其余部分照常工作。
      </p>
      <ErrorTrigger />
    </div>
  );
}
