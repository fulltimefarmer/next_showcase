"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getAssets, createAsset, updateAsset, deleteAsset } from "./actions";
import { getEmployees } from "../employees/actions";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "maintenance", label: "Maintenance" },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  serialNumber: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  purchaseDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Asset = Awaited<ReturnType<typeof getAssets>>[number];
type Employee = Awaited<ReturnType<typeof getEmployees>>[number];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700",
    in_use: "bg-blue-50 text-blue-700",
    maintenance: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        map[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export function AssetList({
  initialData,
  initialEmps,
}: {
  initialData: Asset[];
  initialEmps: Employee[];
}) {
  const [data, setData] = useState(initialData);
  const [employees] = useState(initialEmps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState<Asset | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      serialNumber: "",
      status: "available",
      assignedTo: "",
      purchaseDate: "",
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        type: editing.type,
        serialNumber: editing.serialNumber || "",
        status: editing.status,
        assignedTo: editing.assignedTo ? String(editing.assignedTo) : "",
        purchaseDate: editing.purchaseDate || "",
      });
    } else {
      form.reset({
        name: "",
        type: "",
        serialNumber: "",
        status: "available",
        assignedTo: "",
        purchaseDate: "",
      });
    }
  }, [editing, form]);

  async function onFormSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        assignedTo: values.assignedTo ? Number(values.assignedTo) : null,
      };
      if (editing) {
        await updateAsset(editing.id, payload);
        toast.success("Asset updated");
      } else {
        await createAsset(payload);
        toast.success("Asset created");
      }
      setModalOpen(false);
      setEditing(null);
      const fresh = await getAssets();
      setData(fresh);
    } catch {
      toast.error("Operation failed");
    }
  }

  async function onDelete() {
    if (!deleting) return;
    try {
      await deleteAsset(deleting.id);
      toast.success("Asset deleted");
      setDeleting(null);
      const fresh = await getAssets();
      setData(fresh);
    } catch {
      toast.error("Delete failed");
    }
  }

  function getEmpName(empId: number | null) {
    if (!empId) return "—";
    const emp = employees.find((e) => e.id === empId);
    return emp?.name || "—";
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Add Asset
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No assets found. Click &quot;Add Asset&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Serial No.</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="w-28 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-slate-100 text-sm hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {asset.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{asset.type}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {asset.serialNumber || "—"}
                  </td>
                  <td className="px-4 py-3">{statusBadge(asset.status)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {getEmpName(asset.assignedTo)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(asset);
                          setModalOpen(true);
                        }}
                        className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(asset)}
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
                {editing ? "Edit Asset" : "New Asset"}
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
                  placeholder="e.g. MacBook Pro 16&quot;"
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
                    Type *
                  </label>
                  <input
                    {...form.register("type")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Laptop"
                  />
                  {form.formState.errors.type && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors.type.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Serial No.
                  </label>
                  <input
                    {...form.register("serialNumber")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="SN-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    {...form.register("status")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assign To
                  </label>
                  <select
                    {...form.register("assignedTo")}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">— Unassigned —</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  {...form.register("purchaseDate")}
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
              Delete Asset
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
