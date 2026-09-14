// ============================================================================
// 【Next.js 知识点 · 新增案例】loading.tsx — 路由级加载态
// ============================================================================
// 1. loading.tsx 与 page.tsx 同级，当该路由的页面正在加载时自动显示
// 2. 触发条件：page.tsx 是 async 且内部 await 数据（导航切换、首次请求时）
// 3. 本项目 loading/page.tsx 用了 <Suspense> 做组件级流式渲染，因此
//    路由级 loading.tsx 不会被触发；它演示的是「整个路由」的加载态
//    （例如一个 async 的 page 在 await 期间的占位 UI）
// 4. 与 <Suspense> 的区别：
//    - loading.tsx = 路由级，整页加载态
//    - <Suspense>  = 组件级，局部流式渲染
// ============================================================================

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <p className="text-sm text-slate-500">Loading page...</p>
      </div>
    </div>
  );
}
