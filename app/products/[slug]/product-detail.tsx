"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../cart-context";
import type { products, skus } from "@/lib/db/schema";

type Product = typeof products.$inferSelect;
type Sku = typeof skus.$inferSelect;

function skuLabel(sku: Sku): string {
  return sku.attributes?.label ?? sku.skuId;
}

export function ProductDetail({
  product,
  skus,
}: {
  product: Product;
  skus: Sku[];
}) {
  const { addItem } = useCart();
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);

  const selectedSku = skus.find((s) => s.skuId === selectedSkuId) ?? null;
  const minPrice = skus.length ? Math.min(...skus.map((s) => s.price)) : 0;
  const price = selectedSku?.price ?? null;
  const stock = selectedSku?.stock ?? 0;
  const image = selectedSku?.imageUrl ?? product.imageUrl;

  function handleAdd() {
    if (!selectedSku) return;
    addItem({
      productId: product.id,
      skuId: selectedSku.skuId,
      name: `${product.name} (${skuLabel(selectedSku)})`,
      price: selectedSku.price,
    });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-medium text-blue-600 hover:underline"
      >
        ← Continue shopping
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-red-600">
            {price !== null ? `$${price}` : `From $${minPrice}`}
          </p>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-slate-700">Options</p>
            <div className="flex flex-wrap gap-2">
              {skus.map((sku) => (
                <button
                  key={sku.skuId}
                  type="button"
                  onClick={() => setSelectedSkuId(sku.skuId)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                    selectedSkuId === sku.skuId
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {skuLabel(sku)}
                </button>
              ))}
            </div>
          </div>

          {selectedSku && (
            <p className="mt-4 text-sm text-slate-500">
              {stock > 0 ? `In stock: ${stock}` : "Out of stock"}
            </p>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedSku || stock <= 0}
            className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-48"
          >
            {!selectedSku ? "Select an option" : "Add to Cart"}
          </button>
        </div>
      </div>

      {product.description && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>
        </div>
      )}
    </main>
  );
}
