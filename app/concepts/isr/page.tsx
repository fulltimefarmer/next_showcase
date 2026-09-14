// ============================================================================
// 【Next.js 知识点 · 新增案例】ISR — 增量静态再生成 (Incremental Static Regeneration)
// ============================================================================
// 1. export const revalidate = 10 表示：
//    - 首次请求：按需生成静态页面并缓存
//    - 10 秒内的请求：直接返回缓存（快，不查数据）
//    - 超过 10 秒后的下一次请求：后台重新生成，返回新内容
// 2. 对比本项目其他页面的 force-dynamic：
//    - force-dynamic = 每次请求都实时渲染（SSR）
//    - revalidate   = 静态缓存 + 定时后台更新（ISR，性能更好）
// 3. 适合：内容更新不频繁、但需要一定新鲜度的页面（商品详情、文章页等）
// 4. 注意：ISR 只在生产构建（pnpm build + pnpm start）中生效，
//    dev 模式每次请求都会重新渲染（便于调试）
// ============================================================================

// 每 10 秒重新验证一次（生产环境生效）
export const revalidate = 10;

export default function IsrDemoPage() {
  // 记录「这次渲染」的时间，观察缓存行为
  const renderedAt = new Date().toLocaleString();

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        ISR (revalidate = 10)
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        本页面缓存 10 秒。生产环境中连续刷新，你会看到渲染时间每 10 秒才更新一次。
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">本次页面渲染时间：</p>
        <p className="text-2xl font-bold text-slate-900">{renderedAt}</p>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <p className="font-medium">如何验证 ISR？</p>
        <ol className="mt-1 list-decimal pl-5">
          <li>运行 pnpm build &amp;&amp; pnpm start</li>
          <li>访问 /concepts/isr，记下渲染时间</li>
          <li>连续刷新，10 秒内时间不变；超过 10 秒后刷新，时间更新</li>
        </ol>
      </div>
    </div>
  );
}
