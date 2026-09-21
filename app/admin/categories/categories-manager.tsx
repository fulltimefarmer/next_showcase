"use client";

import { useState } from "react";
import { deleteCategory, saveCategory } from "../actions";
import { useToast } from "../../toast";
import type { categories } from "@/lib/db/schema";

type Category = typeof categories.$inferSelect;

const inputCls =
  "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export function CategoriesManager({
  categories,
  productCountByCategory,
}: {
  categories: Category[];
  productCountByCategory: Map<number, number>;
}) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const formOpen = open || editing !== null;

  async function handleSubmit(formData: FormData) {
    const wasEditing = editing !== null;
    setSaving(true);
    setError("");
    try {
      const result = await saveCategory(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      showToast(wasEditing ? "Category updated" : "Category created");
      setEditing(null);
      setOpen(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">{categories.length} categories</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add category
        </button>
      </div>

      {formOpen && (
        <form
          key={editing?.id ?? "new"}
          action={handleSubmit}
          className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-4">
              {error}
            </p>
          )}
          <input
            name="name"
            placeholder="Name"
            required
            defaultValue={editing?.name}
            className={inputCls}
          />
          <input
            name="slug"
            placeholder="Slug"
            required
            defaultValue={editing?.slug}
            className={inputCls}
          />
          <input
            name="sort"
            type="number"
            placeholder="Sort"
            defaultValue={editing?.sort ?? 0}
            className={inputCls}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setOpen(false);
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
          <input
            name="description"
            placeholder="Description"
            defaultValue={editing?.description ?? ""}
            className={`${inputCls} sm:col-span-4`}
          />
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Sort</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const productCount = productCountByCategory.get(category.id) ?? 0;
              return (
                <tr key={category.id} className="border-b border-slate-50 last:border-b-0">
                  <td className="px-4 py-2 text-slate-500">{category.id}</td>
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {category.name}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{category.slug}</td>
                  <td className="px-4 py-2 text-slate-500">{category.description}</td>
                  <td className="px-4 py-2 text-slate-500">{category.sort}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(category);
                          setOpen(false);
                        }}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      {productCount > 0 ? (
                        <span
                          className="cursor-not-allowed rounded px-2 py-1 text-xs font-medium text-slate-400"
                          title={`${productCount} products in this category`}
                        >
                          In use ({productCount})
                        </span>
                      ) : (
                        <form
                          action={deleteCategory}
                          onSubmit={(e) => {
                            if (!window.confirm("Delete this category?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={category.id} />
                          <button
                            type="submit"
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
