import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

/**
 * NextAuth v5 (Auth.js) 配置
 *
 * 核心概念：
 * - Credentials Provider: 用户名密码登录
 * - JWT Callback: 将 role 写入 token
 * - Session Callback: 将 role 从 token 同步到前端 session
 *
 * 预置测试账号（学习用途）：
 *   admin / admin     → role: admin  (全部权限)
 *   manager / manager → role: manager (管理权限)
 *   user / user       → role: user    (普通员工)
 */

// 模拟用户数据库（实际项目应查询真实数据库）
const USERS = [
  { id: "1", name: "Admin", role: "admin", password: "admin" },
  { id: "2", name: "Manager", role: "manager", password: "manager" },
  { id: "3", name: "User", role: "user", password: "user" },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize(credentials) {
        const username = (credentials?.username as string) || "";
        const password = (credentials?.password as string) || "";
        const user = USERS.find(
          (u) =>
            u.name.toLowerCase() === username.toLowerCase() &&
            u.password === password
        );
        if (user) {
          return { id: user.id, name: user.name, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // JWT 回调：登录时将用户信息写入 token
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    // Session 回调：将 token 中的 role 传递给前端 useSession()
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
