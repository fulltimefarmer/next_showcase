import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports - maxopc" };

export const dynamic = "force-dynamic";

const stats = [
  { label: "Revenue", value: "$12,480", delta: "+8.2%" },
  { label: "Orders", value: "1,204", delta: "+3.1%" },
  { label: "Customers", value: "856", delta: "+12.5%" },
  { label: "Conversion", value: "3.4%", delta: "-0.4%" },
];

const weeklySales = [42, 68, 55, 82, 60, 92, 74];

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sales report</h1>
      <p className="mt-1 text-sm text-slate-500">
        Demo placeholder data — real analytics coming later.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p
              className={`mt-1 text-xs font-medium ${
                stat.delta.startsWith("-") ? "text-red-500" : "text-green-600"
              }`}
            >
              {stat.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Weekly sales
        </h2>
        <div className="flex h-48 items-end gap-3">
          {weeklySales.map((height, i) => (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className="flex-1 rounded-t bg-blue-500/80"
            />
          ))}
        </div>
        <div className="mt-2 flex gap-3 text-center text-xs text-slate-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day} className="flex-1">
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
