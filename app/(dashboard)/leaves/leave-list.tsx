// ============================================================================
// 【Next.js 知识点】审批工作流 — Client Component 状态机
// ============================================================================
// 1. 请假流程是一个典型的状态机:
//    pending → approved（批准） 或 pending → rejected（拒绝）
// 2. 审批按钮只在对应状态下显示（条件渲染）
//    - pending 状态: 显示 Approve / Reject 按钮
//    - approved/rejected: 仅显示删除按钮
// 3. 每个审批操作调用 Server Action，成功后重新获取数据刷新列表
// 4. 跨模块数据依赖: 这个组件需要 employees 和 leaveTypes 数据来填充下拉框
//    - 这些数据在 page.tsx (Server Component) 中通过 Promise.all 并行获取
// ============================================================================

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2, X, Check, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  deleteLeaveRequest,
  getLeaveTypes,
} from "./actions";
import type { getEmployees } from "../employees/actions";

const formSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type LeaveRequest = Awaited<ReturnType<typeof getLeaveRequests>>[number];
type LeaveType = Awaited<ReturnType<typeof getLeaveTypes>>[number];
type Employee = Awaited<ReturnType<typeof getEmployees>>[number];

interface Props {
  initialData: LeaveRequest[];
  leaveTypes: LeaveType[];
  employees: Employee[];
}

/** 状态映射：颜色 + 显示文本 */
const statusMap: Record<
  string,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  approved: {
    label: "Approved",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-red-50 text-red-700 ring-red-600/20",
  },
};

export function LeaveList({ initialData, leaveTypes, employees }: Props) {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<LeaveRequest | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "",
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createLeaveRequest({
        employeeId: Number(values.employeeId),
        leaveTypeId: Number(values.leaveTypeId),
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason,
      });
      toast.success("Leave request submitted");
      setModalOpen(false);
      form.reset();
      const fresh = await getLeaveRequests();
      setData(fresh);
    } catch {
      toast.error("Submission failed");
    }
  }

  async function onApprove(id: number) {
    try {
      // 模拟审批人 ID 为 1 (Admin)
      await approveLeaveRequest(id, 1);
      toast.success("Leave approved");
      const fresh = await getLeaveRequests();
      setData(fresh);
    } catch {
      toast.error("Approval failed");
    }
  }

  async function onReject(id: number) {
    try {
      await rejectLeaveRequest(id, 1);
      toast.success("Leave rejected");
      const fresh = await getLeaveRequests();
      setData(fresh);
    } catch {
      toast.error("Rejection failed");
    }
  }

  async function onDelete() {
    if (!deleting) return;
    try {
      await deleteLeaveRequest(deleting.id);
      toast.success("Request deleted");
      setDeleting(null);
      const fresh = await getLeaveRequests();
      setData(fresh);
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leave Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit, approve or reject leave requests (workflow demo)
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Request Leave
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No leave requests yet.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-36 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((req) => {
                const status = statusMap[req.status] || statusMap.pending;
                return (
                  <tr
                    key={req.id}
                    className="border-b border-slate-100 text-sm hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {req.employeeName || `#${req.employeeId}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {req.leaveTypeName || `#${req.leaveTypeId}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {req.startDate && req.endDate
                        ? `${new Date(req.startDate).toLocaleDateString()} → ${new Date(req.endDate).toLocaleDateString()}`
                        : "—"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-500">
                      {req.reason || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {/* 审批/拒绝按钮 — 只在 pending 状态显示 */}
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => onApprove(req.id)}
                              className="rounded p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                              title="Approve"
                            >
                              <Check className="size-4" />
                            </button>
                            <button
                              onClick={() => onReject(req.id)}
                              className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Reject"
                            >
                              <XCircle className="size-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleting(req)}
                          className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Leave Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Request Leave
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 选择员工 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Employee
                </label>
                <select
                  {...form.register("employeeId")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.employeeId && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.employeeId.message}
                  </p>
                )}
              </div>

              {/* 选择请假类型 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Leave Type
                </label>
                <select
                  {...form.register("leaveTypeId")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select type...</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.leaveTypeId && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.leaveTypeId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...form.register("startDate")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {form.formState.errors.startDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...form.register("endDate")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {form.formState.errors.endDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Reason
                </label>
                <textarea
                  {...form.register("reason")}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Optional reason"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Delete Request
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Delete this leave request permanently?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
