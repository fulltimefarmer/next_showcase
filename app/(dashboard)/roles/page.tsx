// ============================================================================
// 【Next.js 知识点】Server Component 页面级权限控制
// ============================================================================
// 1. auth() 是服务端获取 session 的方法（来自 lib/auth.ts 的导出）
//    - 只能在 Server Component 或 Server Action 中使用
//    - 与客户端 useSession() 不同，auth() 直接读取 cookie，无额外网络请求
// 2. redirect() 是服务端重定向
//    - 在 Server Component 中调用会抛出 NEXT_REDIRECT error
//    - Next.js 会捕获这个 error 并返回 307 重定向响应
//    - 比 middleware 更灵活，可以做数据库查询后再决定是否重定向
// 3. 页面级权限检查 vs middleware 权限检查:
//    - middleware: 太快，无法访问数据库，只能做基本检查
//    - page: 可以查数据库，可以做复杂逻辑，但比 middleware 晚执行
//    - 推荐: middleware 做登录检查，page 做角色/权限检查
// ============================================================================

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRoles } from "./actions";
import { RoleList } from "./role-list";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  // 【Next.js + Auth.js】auth() 获取完整 session（包含 JWT 中的自定义字段如 role）
  // middleware 中的 session 不包含 role，这里可以获取到
  const session = await auth();
  // 【Next.js】redirect: 服务端重定向，比 Response.redirect 更简洁
  if ((session?.user as { role?: string })?.role !== "admin") {
    redirect("/");
  }
  const data = await getRoles();
  return <RoleList initialData={data} />;
}
