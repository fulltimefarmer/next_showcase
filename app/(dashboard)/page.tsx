import { db, ensureSchema } from "@/lib/db";
import { departments, employees, assets } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
import { count, sql } from "drizzle-orm";
import { Building2, Users, Package, CheckCircle, AlertTriangle, Wrench } from "lucide-react";

export default async function DashboardPage() {
  await ensureSchema();

  const [deptCount] = await db.select({ value: count() }).from(departments);
  const [empCount] = await db.select({ value: count() }).from(employees);
  const [assetCount] = await db.select({ value: count() }).from(assets);
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

  const stats = [
    { label: "Departments", value: deptCount.value, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Employees", value: empCount.value, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Assets", value: assetCount.value, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const assetStats = [
    { label: "Available", value: availableCount.value, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In Use", value: inUseCount.value, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Maintenance", value: maintenanceCount.value, icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="grid gap-4 sm:grid-cols-3">
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
    </div>
  );
}
