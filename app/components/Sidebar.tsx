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
  const pathname = usePathname();
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
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
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
            <div className="text-xs text-slate-400">
              Role: {(session?.user as { role?: string })?.role || "—"}
            </div>
          </div>
        )}
        <button
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
