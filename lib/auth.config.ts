import type { NextAuthConfig } from "next-auth";

/**
 * NextAuth 路由级授权配置
 *
 * authorized 回调在 middleware 中执行，比页面渲染更早
 * 只做登录状态检查，角色权限由各页面/Server Action 独立校验
 *
 * 注意：middleware 中的 auth.user 仅包含 name/email/image
 * 自定义字段（如 role）不会出现在 middleware 的 session 中
 * 如需角色判断，请在 Server Component 中使用 auth() 获取完整 session
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (pathname === "/login") {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
