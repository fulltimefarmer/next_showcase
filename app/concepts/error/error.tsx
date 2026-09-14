// ============================================================================
// 【Next.js 知识点 · 新增案例】error.tsx 错误边界
// ============================================================================
// 1. error.tsx 必须是客户端组件（"use client"），接收 { error, reset } 两个 props
// 2. error: 抛出的错误对象；reset: 重新渲染该路由的函数
// 3. 错误边界只作用于「当前路由段」，不影响 layout 和整站 —— 这是局部容错的关键
// 4. 生产环境 error 信息不会泄露给客户端（只显示通用文案），开发环境可见详情
// ============================================================================

"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 可将错误上报到监控平台（如 Sentry）
  useEffect(() => {
    console.error("Concepts/error 边界捕获到错误:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold text-red-700">
          Something went wrong!
        </h2>
        <p className="mb-4 text-sm text-red-600">
          这个错误被 error.tsx 局部捕获，页面的 layout 和站点其余部分仍然正常工作。
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Try again (reset)
        </button>
      </div>
    </div>
  );
}
