// ============================================================================
// 【Next.js 知识点】Client Component — 客户端导航与 session
// ============================================================================
// 1. "use client" 标记这是客户端组件
// 2. usePathname(): 获取当前 URL 路径名，用于高亮当前导航项
//    - 只能在客户端组件中使用（它是浏览器 API 的抽象）
// 3. Link (next/link): 客户端路由跳转，不会刷新页面（SPA 体验）
//    - 与 <a> 不同，Link 只更新内容不重新加载 JS/CSS
// 4. useSession(): Auth.js 客户端 hook，获取当前登录用户信息
//    - 必须在 SessionProvider 内部使用
// 5. signOut(): Auth.js 客户端方法，清除 session 并跳转
// ============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Shield,
  Calendar,
  ScrollText,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/leaves", label: "Leave Mgmt", icon: Calendar },
  { href: "/salaries", label: "Salaries", icon: DollarSign },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/roles", label: "Roles & RBAC", icon: Shield },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export default function Sidebar() {
  // 【Next.js】usePathname: 获取当前路径，返回字符串如 "/departments"
  // 路径变化时自动触发重新渲染
  const pathname = usePathname();
  // 【Auth.js】useSession: 客户端获取 session（缓存，不会每次重新请求）
  // 返回 { data: session, status: "loading"|"authenticated"|"unauthenticated" }
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-white transition-all ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xs font-bold text-white">CM</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Company MS
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex size-7 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xs font-bold text-white">CM</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-3">
        {navItems.map((item) => {
          // 【Next.js】判断活跃路由: 精确匹配首页，前缀匹配子页面
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            // 【Next.js】Link 组件: href 指定目标路由
            // 点击后 Next.js 在客户端用 History API 更新 URL，
            // 只渲染变化的页面部分（layout 不会重新渲染）
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-2 py-3">
        {!collapsed && (
          <div className="mb-2 px-3">
            <div className="text-sm font-medium text-slate-700">
              {session?.user?.name}
            </div>
            {/* 【Next.js + Auth.js】session.user 包含 JWT callback 注入的自定义字段 */}
            <div className="text-xs text-slate-400">
              Role: {(session?.user as { role?: string })?.role || "—"}
            </div>
          </div>
        )}
        <button
          // 【Auth.js】signOut: 清除 session cookie，默认跳转到首页
          // callbackUrl 指定登出后的目标页面
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${
            collapsed ? "justify-center" : ""
          }`}
          title="Sign out"
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 items-center justify-center border-t border-slate-200 text-slate-400 transition hover:text-slate-600"
      >
        {collapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </button>
    </aside>
  );
}
