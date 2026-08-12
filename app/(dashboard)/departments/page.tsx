// ============================================================================
// 【Next.js 知识点】Server Component 作为 Data Loader
// ============================================================================
// 1. async Server Component: 可以直接在渲染前获取数据
//    - 等价于 Pages Router 的 getServerSideProps，但更直观
//    - 数据获取和组件渲染在同一个函数中
// 2. 把数据通过 props 传给 Client Component:
//    - Server Component 获取数据（服务端直接访问 DB）
//    - Client Component 负责交互（状态管理、表单、事件）
//    - 这是 Next.js App Router 推荐的 "Server/Client 分离" 模式
// 3. 为什么不让 Client Component 自己获取数据？
//    - 避免暴露数据库连接细节到客户端
//    - 避免额外的 API 请求（Server Component 直接查询 DB）
//    - 更好的首屏加载性能（HTML 已经包含数据）
// ============================================================================

import { getDepartments } from "./actions";
import { DepartmentList } from "./department-list";

// 【Next.js】force-dynamic: 确保页面每次都重新获取数据，而非使用构建时的缓存
export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  // 【Next.js】Server Component 中直接 await 数据 — 把 DB 查询紧贴渲染逻辑
  // 等价于 Pages Router 的: export async function getServerSideProps() { return { props: {...} } }
  const data = await getDepartments();
  // 把初始数据传给客户端组件，之后客户端组件通过再次调用 Server Actions 刷新
  return <DepartmentList initialData={data} />;
}
