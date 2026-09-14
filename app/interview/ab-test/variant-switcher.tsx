// ============================================================================
// 【Next.js 知识点】A/B 测试变体切换器（客户端）
// ============================================================================

"use client";

import { useRouter } from "next/navigation";

export function VariantSwitcher() {
  const router = useRouter();

  async function setVariant(variant: string) {
    await fetch("/interview/ab-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant }),
    });
    router.refresh(); // 刷新服务端组件，重新读取 Cookie
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => setVariant("a")} className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700">
        切换到 A 版
      </button>
      <button onClick={() => setVariant("b")} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
        切换到 B 版
      </button>
    </div>
  );
}
