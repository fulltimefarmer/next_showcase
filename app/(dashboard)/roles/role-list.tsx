"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "./actions";
import { PERMISSIONS } from "@/lib/rbac";

const formSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;
type Role = Awaited<ReturnType<typeof getRoles>>[number];

/**
 * 权限列表分组，方便 UI 展示
 * 每个权限项附加 label 便于用户理解
 */
const permissionGroups = [
  {
    group: "Departments",
    items: [
      { key: PERMISSIONS.DEPARTMENTS_READ, label: "View departments" },
      { key: PERMISSIONS.DEPARTMENTS_WRITE, label: "Manage departments" },
    ],
  },
  {
    group: "Employees",
    items: [
      { key: PERMISSIONS.EMPLOYEES_READ, label: "View employees" },
      { key: PERMISSIONS.EMPLOYEES_WRITE, label: "Manage employees" },
    ],
  },
  {
    group: "Assets",
    items: [
      { key: PERMISSIONS.ASSETS_READ, label: "View assets" },
      { key: PERMISSIONS.ASSETS_WRITE, label: "Manage assets" },
    ],
  },
  {
    group: "Roles",
    items: [
      { key: PERMISSIONS.ROLES_READ, label: "View roles" },
      { key: PERMISSIONS.ROLES_WRITE, label: "Manage roles" },
    ],
  },
  {
    group: "Leave Management",
    items: [
      { key: PERMISSIONS.LEAVES_READ, label: "View leaves" },
      { key: PERMISSIONS.LEAVES_WRITE, label: "Request leaves" },
      { key: PERMISSIONS.LEAVES_APPROVE, label: "Approve leaves" },
    ],
  },
  {
    group: "Audit",
    items: [{ key: PERMISSIONS.AUDIT_READ, label: "View audit logs" }],
  },
];

export function RoleList({ initialData }: { initialData: Role[] }) {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  // 当前选中的权限集合，用一个 Set 管理
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", permissions: [] },
  });

  // 编辑时回填表单
  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        description: editing.description || "",
        permissions: editing.permissions,
      });
      setSelectedPermissions(new Set(editing.permissions));
    } else {
      form.reset({ name: "", description: "", permissions: [] });
      setSelectedPermissions(new Set());
    }
  }, [editing, form]);

  /** 切换权限选项的选中状态 */
  function togglePermission(key: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      // 同步到 react-hook-form
      form.setValue("permissions", Array.from(next));
      return next;
    });
  }

  async function onFormSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateRole(editing.id, values);
        toast.success("Role updated");
      } else {
        await createRole(values);
        toast.success("Role created");
      }
      setModalOpen(false);
      setEditing(null);
      const fresh = await getRoles();
      setData(fresh);
    } catch {
      toast.error("Operation failed");
    }
  }

  async function onDelete() {
    if (!deleting) return;
    try {
      await deleteRole(deleting.id);
      toast.success("Role deleted");
      setDeleting(null);
      const fresh = await getRoles();
      setData(fresh);
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage roles and granular permissions (RBAC)
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Add Role
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No roles defined. Click &quot;Add Role&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="w-28 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-slate-100 text-sm hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {role.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {role.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length === 0 ? (
                        <span className="text-slate-400">None</span>
                      ) : (
                        role.permissions.map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(role);
                          setModalOpen(true);
                        }}
                        className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(role)}
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

      {/* Modal: Create/Edit Role */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Edit Role" : "New Role"}
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
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  {...form.register("name")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. manager"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <input
                  {...form.register("description")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>

              {/* 权限选择器：分组复选框 */}
              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-slate-700">
                  Permissions
                </legend>
                <div className="max-h-64 space-y-3 overflow-y-auto rounded-md border border-slate-200 p-3">
                  {permissionGroups.map((group) => (
                    <div key={group.group}>
                      <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                        {group.group}
                      </p>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <label
                            key={item.key}
                            className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.has(item.key)}
                              onChange={() => togglePermission(item.key)}
                              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-700">
                              {item.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({item.key})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>

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

      {/* Confirm Delete Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Delete Role
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Are you sure you want to delete &quot;{deleting.name}&quot;?
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
