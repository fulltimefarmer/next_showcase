// ============================================================================
// 【Next.js 知识点】next/dynamic 代码分割演示页
// ============================================================================
// 1. dynamic(() => import("./heavy"))：把组件拆成独立 chunk，按需加载
// 2. loading：加载期间显示的占位 UI
// 3. ssr: false：跳过服务端渲染，仅在浏览器渲染（适合依赖浏览器 API 的组件）
// ============================================================================

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Heavy = dynamic(() => import("./heavy"), {
  loading: () => <p className="text-sm text-slate-400">加载重组件中...</p>,
  ssr: false,
});

export default function DynamicImportDemoPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">next/dynamic 代码分割</h1>
      <p className="mb-6 text-sm text-slate-500">
        大组件不进入首屏 bundle，点击后才动态加载（观察 Network 面板出现独立 chunk）。
      </p>

      <button
        onClick={() => setShow(true)}
        className="mb-6 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        加载重组件
      </button>

      {show && <Heavy />}

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`const Heavy = dynamic(() => import("./heavy"), {
  loading: () => <p>加载中...</p>,
  ssr: false,
});`}
      </pre>
    </div>
  );
}
