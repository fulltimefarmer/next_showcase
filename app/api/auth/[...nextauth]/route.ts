// ============================================================================
// 【Next.js 知识点】API Route — Catch-all 动态路由
// ============================================================================
// 1. [...nextauth] 是 Catch-all 动态路由，匹配 /api/auth/ 下的所有子路径
//    - /api/auth/signin、/api/auth/callback/credentials 等都走这个 handler
//    - 方括号文件名 = 动态路由参数
// 2. handlers 来自 NextAuth() 的返回值，包含 { GET, POST }
//    - 直接导出给 Next.js 使用，包含登录、回调、登出等全部逻辑
// 3. App Router 的 API Route 约定:
//    - 文件名必须是 route.ts（不是 page.tsx）
//    - 导出 HTTP 方法函数：GET, POST, PUT, DELETE 等
// ============================================================================

import { handlers } from "@/lib/auth";

// 【Next.js API Route】导出 GET 和 POST handler
// Next.js 会自动将 HTTP 请求路由到对应的导出函数
export const { GET, POST } = handlers;
