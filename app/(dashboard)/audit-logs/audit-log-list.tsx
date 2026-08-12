"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { getAuditLogs } from "./actions";
import { toast } from "sonner";

type AuditLog = Awaited<ReturnType<typeof getAuditLogs>>[number];

const actionMap: Record<string, { label: string; badgeClass: string }> = {
  create: {
    label: "Created",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  update: {
    label: "Updated",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  delete: {
    label: "Deleted",
    badgeClass: "bg-red-50 text-red-700 ring-red-600/20",
  },
  approve: {
    label: "Approved",
    badgeClass: "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
  reject: {
    label: "Rejected",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
};

export function AuditLogList({ initialData }: { initialData: AuditLog[] }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const fresh = await getAuditLogs();
      setData(fresh);
      toast.success("Refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track all system operations (read-only)
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No audit records yet. Operations will be logged here automatically.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.map((log) => {
                const action = actionMap[log.action] || {
                  label: log.action,
                  badgeClass:
                    "bg-slate-50 text-slate-700 ring-slate-600/20",
                };
                return (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 text-sm hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {log.user || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${action.badgeClass}`}
                      >
                        {action.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.entity}
                      {log.entityId ? ` #${log.entityId}` : ""}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-400">
                      {log.details
                        ? JSON.stringify(log.details)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
