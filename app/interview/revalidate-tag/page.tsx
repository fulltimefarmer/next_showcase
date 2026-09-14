// ============================================================================
// 【Next.js 知识点】revalidateTag 客户端演示页
// ============================================================================
// 1. 客户端组件直接 import Server Action，像本地函数一样调用
// 2. 观察 generatedAt：点击「自增」前 getCachedCounter 一直返回缓存值（时间不变），
//    点击后 revalidateTag 失效缓存，重新生成（时间更新）
// ============================================================================

"use client";

import { useState } from "react";
import { getCachedCounter, incrementCounter } from "./actions";

export default function RevalidateTagDemoPage() {
  const [state, setState] = useState<{ value: number; generatedAt: string } | null>(null);

  async function load() {
    setState(await getCachedCounter());
  }

  async function increment() {
    await incrementCounter();
    setState(await getCachedCounter());
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        revalidateTag 标签失效
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        对比 revalidatePath 的按路径失效，revalidateTag 是按标签精细失效。
      </p>

      <div className="mb-6 flex gap-2">
        <button onClick={load} className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700">
          读取缓存值
        </button>
        <button onClick={increment} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          自增 + revalidateTag
        </button>
      </div>

      {state && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">缓存的值：</p>
          <p className="text-2xl font-bold text-slate-900">{state.value}</p>
          <p className="mt-2 text-xs text-slate-400">生成时间：{state.generatedAt}</p>
          <p className="mt-2 text-xs text-amber-600">
            提示：连续点「读取缓存值」时间不变（命中缓存）；点「自增」后时间更新（缓存已失效）。
          </p>
        </div>
      )}

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`unstable_cache(async () => ({ value: counter }), ["interview-counter"],
  { tags: ["interview-counter"], revalidate: 3600 });

revalidateTag("interview-counter"); // 失效标签 → 下次重新计算`}
      </pre>
    </div>
  );
}
