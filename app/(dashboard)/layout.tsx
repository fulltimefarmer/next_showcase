// ============================================================================
// 【Next.js 知识点】Route Group Layout — (dashboard) 嵌套布局
// ============================================================================
// 1. (dashboard) 是 Route Group（路由组），括号内的名称不影响 URL 路径
//    - 所有在 (dashboard) 内的页面共享这个 layout，但 URL 中不体现 (dashboard)
//    - 例如 /departments 实际文件路径是 app/(dashboard)/departments/page.tsx
// 2. Route Group 的作用：对路由进行逻辑分组、共享布局，但不影响 URL 结构
// 3. 这个 layout 是嵌套布局（RootLayout → DashboardLayout → Page）
//    - 侧边栏 + 内容区的布局仅作用于管理页面，不包含登录页
// 4. children 是匹配到的 page.tsx 渲染内容
// ============================================================================

import Sidebar from "@/app/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 【Next.js】嵌套布局: 外层 RootLayout 提供 html/body，这里提供页面结构
    <div className="flex h-full">
      <Sidebar />
      {/* flex-1 + overflow-auto 确保主内容区可滚动 */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
