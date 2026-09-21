import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Order confirmed - maxopc" };

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNo?: string }>;
}) {
  const { orderNo } = await searchParams;

  let total: number | null = null;
  if (orderNo) {
    await ensureSchema();
    const [order] = await db
      .select({ total: orders.total })
      .from(orders)
      .where(eq(orders.orderNo, orderNo));
    total = order?.total ?? null;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="size-8 text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-bold text-slate-900">
        Order placed successfully
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Thank you for your purchase. Payment has been completed.
      </p>

      {orderNo ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Order number</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{orderNo}</p>
          {total !== null && (
            <p className="mt-3 text-sm text-slate-500">
              Total:{" "}
              <span className="font-semibold text-slate-900">${total}</span>
            </p>
          )}
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-500">
          No order number found.
        </p>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Continue shopping
      </Link>
    </main>
  );
}
