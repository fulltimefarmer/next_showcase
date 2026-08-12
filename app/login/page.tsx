// ============================================================================
// 【Next.js 知识点】Client Component 登录页面
// ============================================================================
// 1. 登录页不使用 Server Component（不需要服务端数据获取）
// 2. signIn() from "next-auth/react": 客户端登录方法
//    - redirect: false → 手动控制跳转（可以捕获错误、显示 loading）
//    - redirect: true → 自动跳转（默认行为）
// 3. useRouter() from "next/navigation": App Router 的路由 hook
//    - router.push("/"): 客户端跳转
//    - router.refresh(): 刷新服务端组件缓存
// 4. FormData API: 标准浏览器表单 API，比受控 state 更简洁
//    - 对于简单表单（无实时验证），FormData + onSubmit 更高效
// ============================================================================

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  // 【Next.js】useRouter: App Router 的路由 hook（来自 next/navigation）
  // 与 Pages Router 的 next/router 不同，App Router 必须用 next/navigation
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    // 【Next.js + Auth.js】signIn("credentials", options)
    // - "credentials" 对应 Credentials Provider
    // - redirect: false 返回 { error, ok, url } 而不是自动跳转
    const result = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
      setLoading(false);
    } else {
      // 【Next.js】手动跳转 + 刷新
      // push 更新 URL，refresh 强制重新获取服务端组件的 data
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <span className="text-xl font-bold text-white">CM</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Company Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <LogIn className="size-4" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
