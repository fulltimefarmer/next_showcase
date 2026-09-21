import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My Orders - maxopc" };

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await ensureSchema();
  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">My Orders</h1>

      {myOrders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-sm text-slate-500">You have no orders yet.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {myOrders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.orderNo}`}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-blue-600 transition hover:bg-slate-50"
              >
                <span>{order.orderNo}</span>
                <span className="text-slate-400">View →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
