"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Pencil, Trash2, X, Wallet, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  getSalaries,
  createSalary,
  updateSalary,
  paySalary,
  deleteSalary,
} from "./actions";
import type { getEmployees } from "../employees/actions";

const formSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  payPeriod: z.string().min(1, "Pay period is required"),
  baseSalary: z.string().min(1, "Base salary is required"),
  bonus: z.string().optional(),
  deductions: z.string().optional(),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Salary = Awaited<ReturnType<typeof getSalaries>>[number];
type Employee = Awaited<ReturnType<typeof getEmployees>>[number];

const statusMap: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
};

/** 格式化金额为 ¥xx,xxx */
function fmt(n: number) {
  return `¥${n.toLocaleString()}`;
}

export function SalaryList({
  initialData,
  employees,
}: {
  initialData: Salary[];
  employees: Employee[];
}) {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Salary | null>(null);
  const [deleting, setDeleting] = useState<Salary | null>(null);
  const [detail, setDetail] = useState<Salary | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "",
      payPeriod: "",
      baseSalary: "",
      bonus: "",
      deductions: "",
      remarks: "",
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      employeeId: "",
      payPeriod: "",
      baseSalary: "",
      bonus: "",
      deductions: "",
      remarks: "",
    });
    setModalOpen(true);
  }

  function openEdit(s: Salary) {
    setEditing(s);
    form.reset({
      employeeId: String(s.employeeId),
      payPeriod: s.payPeriod,
      baseSalary: String(s.baseSalary),
      bonus: String(s.bonus || ""),
      deductions: String(s.deductions || ""),
      remarks: s.remarks || "",
    });
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateSalary(editing.id, {
          baseSalary: Number(values.baseSalary),
          bonus: values.bonus ? Number(values.bonus) : undefined,
          deductions: values.deductions ? Number(values.deductions) : undefined,
          remarks: values.remarks,
        });
        toast.success("Salary updated");
      } else {
        await createSalary({
          employeeId: Number(values.employeeId),
          payPeriod: values.payPeriod,
          baseSalary: Number(values.baseSalary),
          bonus: values.bonus ? Number(values.bonus) : undefined,
          deductions: values.deductions ? Number(values.deductions) : undefined,
          remarks: values.remarks,
        });
        toast.success("Salary record created");
      }
      setModalOpen(false);
      setEditing(null);
      const fresh = await getSalaries();
      setData(fresh);
    } catch {
      toast.error("Operation failed");
    }
  }

  async function onPay(id: number) {
    try {
      await paySalary(id);
      toast.success("Salary marked as paid");
      const fresh = await getSalaries();
      setData(fresh);
    } catch {
      toast.error("Payment failed");
    }
  }

  async function onDelete() {
    if (!deleting) return;
    try {
      await deleteSalary(deleting.id);
      toast.success("Salary record deleted");
      setDeleting(null);
      const fresh = await getSalaries();
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
            Salary Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Employee payroll records and payslip generation
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Add Salary
        </button>
      </div>

      {/* 薪资汇总卡片 */}
      {data.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {(() => {
            const paidTotal = data
              .filter((s) => s.status === "paid")
              .reduce((sum, s) => sum + s.actualPayment, 0);
            const draftCount = data.filter((s) => s.status === "draft").length;
            const paidCount = data.filter((s) => s.status === "paid").length;
            return (
              <>
                <SummaryCard
                  label="Total Paid"
                  value={fmt(paidTotal)}
                  icon={DollarSign}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <SummaryCard
                  label="Paid Records"
                  value={paidCount}
                  icon={Wallet}
                  color="text-blue-600"
                  bg="bg-blue-50"
                />
                <SummaryCard
                  label="Draft Records"
                  value={draftCount}
                  icon={Wallet}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
                <SummaryCard
                  label="Total Records"
                  value={data.length}
                  icon={Wallet}
                  color="text-purple-600"
                  bg="bg-purple-50"
                />
              </>
            );
          })()}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No salary records. Click &quot;Add Salary&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Base</th>
                <th className="px-4 py-3">Bonus</th>
                <th className="px-4 py-3">Deductions</th>
                <th className="px-4 py-3">Net Pay</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-36 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => {
                const st = statusMap[s.status] || statusMap.draft;
                return (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 text-sm hover:bg-slate-50"
                  >
                    <td
                      className="cursor-pointer px-4 py-3 font-medium text-blue-600 hover:underline"
                      onClick={() => setDetail(s)}
                    >
                      {s.employeeName || `#${s.employeeId}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.payPeriod}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {fmt(s.baseSalary)}
                    </td>
                    <td className="px-4 py-3 text-emerald-600">
                      {fmt(s.bonus)}
                    </td>
                    <td className="px-4 py-3 text-red-500">
                      -{fmt(s.deductions)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {fmt(s.actualPayment)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {s.status === "draft" && (
                          <>
                            <button
                              onClick={() => openEdit(s)}
                              className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => onPay(s.id)}
                              className="rounded p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                              title="Mark as paid"
                            >
                              <DollarSign className="size-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleting(s)}
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

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Edit Salary" : "New Salary Record"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Employee
                </label>
                <select
                  {...form.register("employeeId")}
                  disabled={!!editing}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
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

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Pay Period
                </label>
                <input
                  {...form.register("payPeriod")}
                  disabled={!!editing}
                  placeholder="e.g. 2024-07"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                />
                {form.formState.errors.payPeriod && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.payPeriod.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Base Salary
                  </label>
                  <input
                    {...form.register("baseSalary")}
                    type="number"
                    placeholder="0"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {form.formState.errors.baseSalary && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors.baseSalary.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Bonus
                  </label>
                  <input
                    {...form.register("bonus")}
                    type="number"
                    placeholder="0"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Deductions
                  </label>
                  <input
                    {...form.register("deductions")}
                    type="number"
                    placeholder="0"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Remarks
                </label>
                <input
                  {...form.register("remarks")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Optional notes"
                />
              </div>

              {/* Preview actual payment */}
              {form.watch("baseSalary") && (
                <div className="rounded-md bg-slate-50 p-3 text-center">
                  <span className="text-sm text-slate-500">Net Pay = </span>
                  <span className="text-lg font-bold text-slate-900">
                    {fmt(
                      Number(form.watch("baseSalary") || 0) +
                        Number(form.watch("bonus") || 0) -
                        Number(form.watch("deductions") || 0)
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Payslip</h2>
              <button
                onClick={() => setDetail(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500">Employee:</span>
                <span className="font-medium text-slate-900">
                  {detail.employeeName || `#${detail.employeeId}`}
                </span>
                <span className="text-slate-500">Period:</span>
                <span className="text-slate-700">{detail.payPeriod}</span>
                <span className="text-slate-500">Status:</span>
                <span
                  className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusMap[detail.status]?.className}`}
                >
                  {statusMap[detail.status]?.label}
                </span>
                {detail.paidDate && (
                  <>
                    <span className="text-slate-500">Paid Date:</span>
                    <span className="text-slate-700">{detail.paidDate}</span>
                  </>
                )}
              </div>
              <hr className="border-slate-200" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500">Base Salary:</span>
                <span className="text-slate-700">{fmt(detail.baseSalary)}</span>
                <span className="text-slate-500">Bonus:</span>
                <span className="text-emerald-600">
                  +{fmt(detail.bonus)}
                </span>
                <span className="text-slate-500">Deductions:</span>
                <span className="text-red-500">-{fmt(detail.deductions)}</span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-700">
                  Net Payment
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {fmt(detail.actualPayment)}
                </span>
              </div>
              {detail.remarks && (
                <p className="text-xs text-slate-400">
                  Note: {detail.remarks}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Delete Record
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Delete salary record for{" "}
              {deleting.employeeName || `#${deleting.employeeId}`} in{" "}
              {deleting.payPeriod}?
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: typeof DollarSign;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
