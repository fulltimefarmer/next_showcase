// ============================================================================
// 【Next.js 知识点】Auth.js v5 (NextAuth) — 完整认证配置
// ============================================================================
// 1. NextAuth() 返回 { handlers, auth, signIn, signOut }
//    - handlers: { GET, POST } 用于 API Route（/api/auth/[...nextauth]）
//    - auth(): 在 Server Component 中获取 session（等同于服务端 useSession）
//    - signIn/signOut: 登录/登出方法
// 2. Credentials Provider: 自定义用户名密码登录（不使用 OAuth）
// 3. JWT Callback: 登录时将自定义字段（如 role）写入 JWT token
//    - 这个回调只在登录时触发
// 4. Session Callback: 每次读取 session 时触发
//    - 将 JWT 中的自定义字段映射到 session.user 上
// ============================================================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

/**
 * 预置测试账号（学习用途）
 * 实际项目应查询数据库，并对密码做 bcrypt 哈希校验
 */
const USERS = [
  { id: "1", name: "Admin", role: "admin", password: "admin" },
  { id: "2", name: "Manager", role: "manager", password: "manager" },
  { id: "3", name: "User", role: "user", password: "user" },
];

// 【Next.js + Auth.js】NextAuth() 配置入口
// ...authConfig 展开中间件配置（pages、authorized callback）
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // 【Auth.js】Credentials Provider: 用户名密码登录
    // credentials 定义表单字段，authorize 验证凭据
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      // authorize 返回的 user 对象会被编码到 JWT token 中
      // 返回 null 表示登录失败
      authorize(credentials) {
        const username = (credentials?.username as string) || "";
        const password = (credentials?.password as string) || "";
        const user = USERS.find(
          (u) =>
            u.name.toLowerCase() === username.toLowerCase() &&
            u.password === password
        );
        if (user) {
          // 返回给 JWT callback 的 user 对象
          return { id: user.id, name: user.name, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // 【Next.js + Auth.js】JWT Callback: 控制 token 内容
    // user 参数只在登录时存在（后续请求为 undefined）
    // 将 role 写入 token → 持久化到 JWT 中
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    // 【Next.js + Auth.js】Session Callback: 控制前端 session 内容
    // 每次 useSession() 或 auth() 读取时触发
    // 将 JWT 中的 role 映射到 session.user 上
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
