"use client";

import { useState } from "react";
import Link from "next/link";
import type { getCategories, getProducts } from "./shop-actions";
import { useCart } from "./cart-context";

type Category = Awaited<ReturnType<typeof getCategories>>[number];
type Product = Awaited<ReturnType<typeof getProducts>>[number];

export function ProductCatalog({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const { addItem } = useCart();

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const filtered = activeCategory
    ? products.filter((p) => p.categoryId === activeCategory)
    : products;

  return (
    <>
      {/* ===== Mobile: Meituan-style (categories left, products right) ===== */}
      <div className="lg:hidden">
        <div className="flex h-[calc(100dvh-4rem)]">
          <aside className="w-24 shrink-0 touch-manipulation overflow-y-auto border-r border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`block w-full border-l-2 px-2 py-3.5 text-center text-xs font-medium transition ${
                activeCategory === null
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-transparent text-slate-600"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`block w-full border-l-2 px-2 py-3.5 text-center text-xs font-medium transition ${
                  activeCategory === category.id
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-transparent text-slate-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </aside>

          <div className="flex-1 touch-manipulation overflow-y-auto p-3">
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">
                No products in this category.
              </p>
            ) : (
              <ul className="space-y-3">
                {filtered.map((product) => (
                  <li
                    key={product.id}
                    className="flex gap-3 rounded-lg border border-slate-200 bg-white p-2"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="size-20 shrink-0 overflow-hidden rounded-md bg-slate-100"
                    >
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          No image
                        </div>
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/products/${product.slug}`}
                        className="truncate text-sm font-medium text-slate-900 hover:text-blue-600"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <span className="text-sm font-bold text-red-600">
                          ${product.minPrice}
                        </span>
                        <button
                          type="button"
                          aria-label={`Add ${product.name} to cart`}
                          onClick={() =>
                            addItem({
                              productId: product.id,
                              name: product.name,
                              price: product.minPrice,
                            })
                          }
                          className="flex size-8 select-none touch-manipulation items-center justify-center rounded-full bg-blue-600 text-lg font-medium leading-none text-white transition active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ===== Desktop ===== */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === null
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">
              No products in this category.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="mb-3 flex h-28 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
                  >
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-sm">Image placeholder</span>
                    )}
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {product.name}
                    </Link>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                      {categoryName.get(product.categoryId ?? 0) ?? "Uncategorized"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 min-h-10 text-xs text-slate-500">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      ${product.minPrice}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: product.minPrice,
                        })
                      }
                      className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
