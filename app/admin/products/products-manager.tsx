"use client";

import { useState } from "react";
import { deleteProduct, saveProduct } from "../actions";
import { ImageUpload } from "../image-upload";
import { useToast } from "../../toast";
import type { categories, products } from "@/lib/db/schema";

type Product = typeof products.$inferSelect;
type Category = typeof categories.$inferSelect;

const inputCls =
  "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export function ProductsManager({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const formOpen = open || editing !== null;

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  async function handleSubmit(formData: FormData) {
    const wasEditing = editing !== null;
    setSaving(true);
    setError("");
    try {
      const result = await saveProduct(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      showToast(wasEditing ? "Product updated" : "Product created");
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
          <h2 className="text-xl font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">{products.length} products</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add product
        </button>
      </div>

      {formOpen && (
        <form
          key={editing?.id ?? "new"}
          action={handleSubmit}
          className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              name="productId"
              placeholder="Product ID"
              required
              defaultValue={editing?.productId}
              className={inputCls}
            />
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
            <select
              name="status"
              defaultValue={editing?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
            <select
              name="categoryId"
              defaultValue={editing?.categoryId ?? ""}
              className={inputCls}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              name="description"
              placeholder="Description"
              defaultValue={editing?.description ?? ""}
              className={`${inputCls} sm:col-span-2 lg:col-span-3`}
            />
          </div>
          <ImageUpload name="imageUrl" initialUrl={editing?.imageUrl} />
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
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Product ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-50 last:border-b-0">
                <td className="px-4 py-2 text-slate-500">{product.id}</td>
                <td className="px-4 py-2">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-10 rounded-md border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
                      —
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {product.productId}
                </td>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {product.name}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      product.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {categoryName.get(product.categoryId ?? 0) ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(product);
                        setOpen(false);
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <form
                      action={deleteProduct}
                      onSubmit={(e) => {
                        if (!window.confirm("Delete this product?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
