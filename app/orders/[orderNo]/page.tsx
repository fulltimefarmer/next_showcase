import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Order Details - maxopc" };

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  paid: "bg-blue-50 text-blue-600",
  processing: "bg-amber-50 text-amber-600",
  shipped: "bg-purple-50 text-purple-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-orange-50 text-orange-600",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await ensureSchema();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNo, orderNo));
  if (!order || order.userId !== user.id) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Order details</h1>
        <Link
          href="/orders"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Back to My Orders
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-500">Order number</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">{order.orderNo}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 px-4 py-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-slate-500">Status</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                statusStyles[order.status] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-slate-500">Total</p>
            <p className="mt-1 font-semibold text-slate-900">${order.total}</p>
          </div>
          <div>
            <p className="text-slate-500">Email</p>
            <p className="mt-1 truncate text-slate-900">{order.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="mt-1 text-slate-900">
              {order.createdAt.toISOString().slice(0, 10)}
            </p>
          </div>
        </div>

        <div className="px-4 py-3 text-sm font-semibold text-slate-900">Items</div>
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.productName ?? "Product"}
                </p>
                <p className="text-xs text-slate-500">
                  ${item.unitPrice} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                ${item.unitPrice * item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
