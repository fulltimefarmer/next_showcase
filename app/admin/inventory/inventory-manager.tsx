"use client";

import { useState } from "react";
import { deleteSku, saveSku } from "../actions";
import { SearchableSelect } from "../searchable-select";
import { ImageUpload } from "../image-upload";
import { useToast } from "../../toast";
import type { products, skus } from "@/lib/db/schema";

type Sku = typeof skus.$inferSelect;
type Product = typeof products.$inferSelect;

const inputCls =
  "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export function InventoryManager({
  skus,
  products,
}: {
  skus: Sku[];
  products: Product[];
}) {
  const [editing, setEditing] = useState<Sku | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const formOpen = open || editing !== null;

  const productName = new Map(products.map((p) => [p.id, p.name]));
  const productCode = new Map(products.map((p) => [p.id, p.productId]));
  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: `${p.productId} — ${p.name}`,
  }));

  const prefixId = editing ? editing.productId : selectedProductId;
  const prefix = prefixId ? `${productCode.get(prefixId) ?? ""}-` : "";

  async function handleSubmit(formData: FormData) {
    const wasEditing = editing !== null;
    setSaving(true);
    setError("");
    try {
      const result = await saveSku(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      showToast(wasEditing ? "SKU updated" : "SKU created");
      setEditing(null);
      setSelectedProductId(null);
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
          <h2 className="text-xl font-bold text-slate-900">Inventory</h2>
          <p className="text-sm text-slate-500">{skus.length} SKUs</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setSelectedProductId(null);
            setOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add SKU
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
            <SearchableSelect
              name="productId"
              options={productOptions}
              value={editing?.productId}
              disabled={editing !== null}
              placeholder="Search product..."
              onChange={(option) =>
                setSelectedProductId(option ? Number(option.value) : null)
              }
            />
            <div className="flex items-stretch">
              <span className="flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-100 px-3 text-sm text-slate-500">
                {prefix || "---"}
              </span>
              <input
                name="skuId"
                placeholder="SKU ID"
                required
                defaultValue={editing?.skuId}
                className={`${inputCls} w-full rounded-l-none`}
              />
            </div>
            <input
              name="price"
              type="number"
              placeholder="Price"
              defaultValue={editing?.price ?? 0}
              className={inputCls}
            />
            <input
              name="stock"
              type="number"
              placeholder="Stock"
              defaultValue={editing?.stock ?? 0}
              className={inputCls}
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
                setSelectedProductId(null);
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
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">SKU ID</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((sku) => (
              <tr key={sku.id} className="border-b border-slate-50 last:border-b-0">
                <td className="px-4 py-2 text-slate-500">{sku.id}</td>
                <td className="px-4 py-2">
                  {sku.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sku.imageUrl}
                      alt={sku.skuId}
                      className="size-10 rounded-md border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
                      —
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {productName.get(sku.productId) ?? "—"}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {`${productCode.get(sku.productId) ?? ""}-${sku.skuId}`}
                </td>
                <td className="px-4 py-2 text-slate-500">${sku.price}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      sku.stock === 0
                        ? "bg-red-50 text-red-600"
                        : sku.stock < 10
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    {sku.stock}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(sku);
                        setOpen(false);
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <form
                      action={deleteSku}
                      onSubmit={(e) => {
                        if (!window.confirm("Delete this SKU?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={sku.id} />
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
