// ============================================================================
// 【Next.js 知识点】Server Component — 服务端数据获取
// ============================================================================
// 1. 默认 export 的 async 函数组件 = Server Component
//    - 在服务端运行，可以直接访问数据库、文件系统等
//    - 不会发送到客户端 JS bundle，减少包体积
// 2. export const dynamic = "force-dynamic"
//    - Next.js 默认会静态渲染（SSG），force-dynamic 强制动态渲染（SSR）
//    - 对于需要实时数据的页面（如 Dashboard），必须禁用静态渲染
//    - 等价于 Pages Router 的 getServerSideProps
// 3. 可以直接在组件中 await 数据库查询，Next.js 会等待数据就绪再渲染
//    - 多个 await 会串行执行，用 Promise.all 可以并行
// ============================================================================

import { db, ensureSchema } from "@/lib/db";
import { departments, employees, assets, roles, leaveRequests, salaries, performanceReviews } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import {
  Building2, Users, Package, Shield, Calendar, DollarSign, TrendingUp,
  CheckCircle, AlertTriangle, Wrench, Clock, Star,
} from "lucide-react";

// 【Next.js】force-dynamic: 禁用静态渲染，每次请求都在服务端重新获取数据
// 如果不设置，Next.js 会在构建时尝试静态生成这个页面（会报错或返回过期数据）
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 【Next.js】Server Component 中可以直接 await 数据库操作
  // 这些查询都在服务端执行，客户端看不到任何数据库逻辑
  await ensureSchema();

  // 并行获取所有统计数据 (Drizzle ORM 的 count 聚合)
  const [deptCount] = await db.select({ value: count() }).from(departments);
  const [empCount] = await db.select({ value: count() }).from(employees);
  const [assetCount] = await db.select({ value: count() }).from(assets);
  const [roleCount] = await db.select({ value: count() }).from(roles);

  // 资产状态分布
  const [availableCount] = await db
    .select({ value: count() })
    .from(assets)
    .where(sql`${assets.status} = 'available'`);
  const [inUseCount] = await db
    .select({ value: count() })
    .from(assets)
    .where(sql`${assets.status} = 'in_use'`);
  const [maintenanceCount] = await db
    .select({ value: count() })
    .from(assets)
    .where(sql`${assets.status} = 'maintenance'`);

  // 请假审批状态分布
  const [pendingLeaves] = await db
    .select({ value: count() })
    .from(leaveRequests)
    .where(sql`${leaveRequests.status} = 'pending'`);
  const [approvedLeaves] = await db
    .select({ value: count() })
    .from(leaveRequests)
    .where(sql`${leaveRequests.status} = 'approved'`);
  const [rejectedLeaves] = await db
    .select({ value: count() })
    .from(leaveRequests)
    .where(sql`${leaveRequests.status} = 'rejected'`);

  // 薪资统计
  const [salaryCount] = await db.select({ value: count() }).from(salaries);
  const [paidSalaryCount] = await db
    .select({ value: count() })
    .from(salaries)
    .where(sql`${salaries.status} = 'paid'`);

  // 绩效考核统计
  const [reviewCount] = await db.select({ value: count() }).from(performanceReviews);
  const [completedReviewCount] = await db
    .select({ value: count() })
    .from(performanceReviews)
    .where(sql`${performanceReviews.status} = 'completed'`);

  const stats = [
    { label: "Departments", value: deptCount.value, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Employees", value: empCount.value, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Assets", value: assetCount.value, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Roles", value: roleCount.value, icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Salary Records", value: salaryCount.value, icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Reviews", value: reviewCount.value, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  const assetStats = [
    { label: "Available", value: availableCount.value, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In Use", value: inUseCount.value, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Maintenance", value: maintenanceCount.value, icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const leaveStats = [
    { label: "Pending", value: pendingLeaves.value, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approved", value: approvedLeaves.value, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Rejected", value: rejectedLeaves.value, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className={`flex size-10 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`size-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Asset Status</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {assetStats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`flex size-9 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`size-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Leave Requests</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {leaveStats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`flex size-9 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`size-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Payroll & Performance</h2>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50">
              <DollarSign className="size-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Salary Records</p>
              <p className="text-xl font-bold text-slate-900">{salaryCount.value}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Paid</p>
              <p className="text-xl font-bold text-slate-900">{paidSalaryCount.value}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-50">
              <TrendingUp className="size-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Performance Reviews</p>
              <p className="text-xl font-bold text-slate-900">{reviewCount.value}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50">
              <Star className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Completed</p>
              <p className="text-xl font-bold text-slate-900">{completedReviewCount.value}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
