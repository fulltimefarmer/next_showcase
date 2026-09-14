// ============================================================================
// 【Next.js 知识点】Server Component — 模拟慢数据获取
// ============================================================================
// 通过 await 一个 3 秒的 Promise 模拟慢查询（数据库/外部 API）。
// 被 <Suspense> 包裹后，Next.js 会先流式返回 fallback，再推送真实内容。
// ============================================================================

export async function SlowContent({ label }: { label: string }) {
  // 模拟慢查询：真实项目中这里可能是 await db.select() 或 fetch()
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8">
      <p className="text-base font-semibold text-slate-900">{label} 加载完成</p>
      <p className="mt-1 text-sm text-slate-500">
        这块内容 3 秒后才到达，期间上方一直显示 fallback 骨架屏。
      </p>
    </div>
  );
}
