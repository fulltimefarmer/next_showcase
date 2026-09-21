"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../cart-context";
import { createOrder } from "./actions";

export function CheckoutSummary({
  initialEmail = "",
  isAuthenticated = false,
}: {
  initialEmail?: string;
  isAuthenticated?: boolean;
}) {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const effectiveEmail = isAuthenticated ? initialEmail : email;

  const subtotal = total;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
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

  async function handlePlaceOrder() {
    const trimmedEmail = effectiveEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const { orderNo } = await createOrder(items, total, trimmedEmail);
      clearCart();
      router.push(`/checkout/confirmation?orderNo=${orderNo}`);
    } catch {
      setError("Failed to place order. Please try again.");
      setPlacing(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Order summary</h1>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
          Items
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">
                  ${item.price} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                ${item.price * item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Contact email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Required to receive your order confirmation.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={placing}
        className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {placing ? "Placing order..." : "Place order"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">
        Payment is not implemented yet — submitting marks the order as paid.
      </p>
    </main>
  );
}
