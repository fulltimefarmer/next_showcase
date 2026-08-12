// ============================================================================
// 【Next.js 知识点】Middleware — 路由级拦截
// ============================================================================
// 1. proxy.ts 是 Next.js Middleware 文件（名称随意，但必须在根目录通过 export 导出）
// 2. middleware 在 Edge Runtime 执行，在每个请求进入路由 *之前* 运行
// 3. NextAuth(authConfig).auth 返回一个 middleware handler，自动检查登录状态
// 4. config.matcher 控制哪些路由触发 middleware（类似正则白名单）
//    - 这里的 matcher 匹配除了 api、静态资源、favicon 之外的所有路径
// 5. middleware 中的 session 只包含 name/email/image 基本字段
//    自定义字段（如 role）不会出现，需要角色检查请在 Server Component 中做
// ============================================================================

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// 【Next.js】导出 middleware handler，会在每次匹配到的请求前执行
// auth() 内部会读取 cookie 中的 session token，验证后注入 auth 对象
export default NextAuth(authConfig).auth;

// 【Next.js Middleware】config.matcher 控制哪些路径触发 middleware
// 语法是类似正则的 glob 模式，! 表示排除
// 这里匹配所有路径，除了 api、静态资源、favicon
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|svgs).*)"],
};
