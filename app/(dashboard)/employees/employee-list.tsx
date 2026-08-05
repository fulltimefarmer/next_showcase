"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./actions";
import { getDepartments } from "../departments/actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  departmentId: z.string().optional(),
  hireDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Employee = Awaited<ReturnType<typeof getEmployees>>[number];
type Department = Awaited<ReturnType<typeof getDepartments>>[number];

export function EmployeeList({
  initialData,
  initialDepts,
}: {
  initialData: Employee[];
  initialDepts: Department[];
}) {
  const [data, setData] = useState(initialData);
  const [departments] = useState(initialDepts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      departmentId: "",
      hireDate: "",
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        email: editing.email || "",
        phone: editing.phone || "",
        position: editing.position || "",
        departmentId: editing.departmentId ? String(editing.departmentId) : "",
        hireDate: editing.hireDate || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        position: "",
        departmentId: "",
        hireDate: "",
      });
    }
  }, [editing, form]);

  async function onFormSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        departmentId: values.departmentId ? Number(values.departmentId) : null,
      };
      if (editing) {
        await updateEmployee(editing.id, payload);
        toast.success("Employee updated");
      } else {
        await createEmployee(payload);
        toast.success("Employee created");
      }
      setModalOpen(false);
      setEditing(null);
      const fresh = await getEmployees();
      setData(fresh);
    } catch {
      toast.error("Operation failed");
    }
  }

  async function onDelete() {
    if (!deleting) return;
    try {
      await deleteEmployee(deleting.id);
      toast.success("Employee deleted");
      setDeleting(null);
      const fresh = await getEmployees();
      setData(fresh);
    } catch {
      toast.error("Delete failed");
    }
  }

  function getDeptName(deptId: number | null) {
    if (!deptId) return "—";
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || "—";
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Add Employee
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No employees found. Click &quot;Add Employee&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Hire Date</th>
                <th className="w-28 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-100 text-sm hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {emp.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {emp.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {emp.position || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {getDeptName(emp.departmentId)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {emp.hireDate || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(emp);
                          setModalOpen(true);
                        }}
                        className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(emp)}
                        className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Edit Employee" : "New Employee"}
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

            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  {...form.register("name")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Full name"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    {...form.register("email")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    {...form.register("phone")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Position
                  </label>
                  <input
                    {...form.register("position")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Department
                  </label>
                  <select
                    {...form.register("departmentId")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">— None —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Hire Date
                </label>
                <input
                  type="date"
                  {...form.register("hireDate")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

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

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Delete Employee
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Are you sure you want to delete &quot;{deleting.name}&quot;? This
              action cannot be undone.
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
