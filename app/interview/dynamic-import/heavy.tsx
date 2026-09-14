// ============================================================================
// 【Next.js 知识点】next/dynamic — 大组件（模拟）演示按需加载
// ============================================================================
// 这个「重组件」用大量 DOM 模拟体积大、首屏用不到的场景，
// 通过 next/dynamic 延迟加载，避免进入首屏 JS bundle。
// ============================================================================

"use client";

export default function HeavyComponent() {
  const items = Array.from({ length: 200 }, (_, i) => i + 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">
        按需加载的重组件（200 个元素）
      </h2>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => (
          <span key={i} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
