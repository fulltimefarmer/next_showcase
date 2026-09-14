// ============================================================================
// 【Next.js 知识点】useTransition — 非紧急更新
// ============================================================================
// 1. startTransition 把「慢更新」标记为非紧急，让输入等紧急交互不被阻塞
// 2. isPending 表示过渡正在进行中，可显示加载指示
// 3. 适用场景：大列表过滤、路由切换、复杂计算
// ============================================================================

"use client";

import { useState, useTransition } from "react";

const BIG_LIST = Array.from({ length: 2000 }, (_, i) => `Item ${i + 1}`);

export default function TransitionDemoPage() {
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    setInput(value); // 紧急：输入框立即响应
    startTransition(() => setFilter(value)); // 非紧急：列表过滤可稍后
  }

  const filtered = filter
    ? BIG_LIST.filter((i) => i.toLowerCase().includes(filter.toLowerCase()))
    : BIG_LIST;

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">useTransition 非紧急更新</h1>
      <p className="mb-6 text-sm text-slate-500">
        2000 条列表过滤：输入框立即响应，列表过滤标记为非紧急更新。
      </p>

      <input
        value={input}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入关键字过滤列表..."
        className="mb-4 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <p className="mb-2 text-sm text-slate-500">
        匹配 {filtered.length} 条 {isPending && <span className="text-amber-600">（过滤中...）</span>}
      </p>

      <ul className="max-h-80 space-y-1 overflow-auto rounded-lg border border-slate-200 bg-white p-4">
        {filtered.slice(0, 50).map((i) => (
          <li key={i} className="text-sm text-slate-600">{i}</li>
        ))}
        {filtered.length > 50 && <li className="text-xs text-slate-400">... 仅显示前 50 条</li>}
      </ul>

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`const [isPending, startTransition] = useTransition();
setInput(value);                    // 紧急更新
startTransition(() => setFilter(v)); // 非紧急更新`}
      </pre>
    </div>
  );
}
