// ============================================================================
// 【Next.js 知识点 · 新增案例】错误边界触发组件
// ============================================================================
// 客户端组件：点击按钮抛出一个 Error，用于演示 error.tsx 的捕获。
// 真实场景中错误可能来自：Server Component 的查询异常、渲染异常等。
// ============================================================================

"use client";

import { useState } from "react";

export function ErrorTrigger() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        点击下方按钮会抛出一个渲染错误，被同目录的 error.tsx 捕获。
      </p>
      <button
        onClick={() => {
          // 抛出错误 → 触发 error.tsx 边界
          throw new Error("演示错误：这是人为抛出的渲染异常");
        }}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Throw error (触发错误边界)
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">
          正常内容不受影响，计数：{count}
        </p>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="mt-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          +1
        </button>
      </div>
    </div>
  );
}
