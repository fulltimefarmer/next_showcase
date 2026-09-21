"use client";

import Link from "next/link";
import { useCart } from "../cart-context";

export function CartView() {
  const { items, total, removeItem, setQuantity } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Your cart</h1>
        <p className="mt-4 text-sm text-slate-500">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Your cart</h1>

      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {item.name}
              </p>
              <p className="text-xs text-slate-500">${item.price} each</p>
            </div>

            <div className="flex items-center rounded-md border border-slate-300">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity(item.key, item.quantity - 1)}
                className="select-none touch-manipulation px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium text-slate-900">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity(item.key, item.quantity + 1)}
                className="select-none touch-manipulation px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                +
              </button>
            </div>

            <span className="w-20 text-right text-sm font-semibold text-slate-900">
              ${item.price * item.quantity}
            </span>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Remove this item from the cart?")) {
                  removeItem(item.key);
                }
              }}
              className="select-none touch-manipulation rounded px-2 py-2 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <span className="text-base font-semibold text-slate-900">Total</span>
        <span className="text-lg font-bold text-slate-900">${total}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Checkout
      </Link>
    </main>
  );
}
