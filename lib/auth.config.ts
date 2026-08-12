// ============================================================================
// 【Next.js 知识点】Auth.js v5 中间件配置
// ============================================================================
// 1. NextAuthConfig 是 Auth.js v5 的配置类型（Edge 兼容）
// 2. authorized 回调在 middleware 中执行，返回 true/false/Response
//    - 返回 true: 放行请求
//    - 返回 false 或 Response.redirect: 拦截并重定向
// 3. auth.user 在 middleware 中类型为 { name?, email?, image? }
//    自定义字段（如 role）不会出现在 middleware 的 session 中
//    这是因为 middleware 运行在 Edge Runtime，session 解码是轻量级的
// ============================================================================

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // 【Auth.js】pages 配置：指定自定义登录页路由
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 【Next.js + Auth.js】authorized 回调 = middleware 中的权限判断
    // 在每次路由请求时被调用，auth 来自 cookie 中的 session token
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // 已登录用户不能访问登录页 → 重定向到首页
      if (pathname === "/login") {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // 未登录用户全部重定向到登录页
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // 已登录 → 放行（页面级角色检查在各 page.tsx 中完成）
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
