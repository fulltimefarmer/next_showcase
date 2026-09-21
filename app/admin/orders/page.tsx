import type { Metadata } from "next";
import { asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, orders } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Orders - maxopc" };

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

export default async function OrdersPage() {
  const [orderRows, customerRows] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100),
    db.select().from(customers).orderBy(asc(customers.id)),
  ]);

  const customerName = new Map(customerRows.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Orders</h2>
        <p className="text-sm text-slate-500">{orderRows.length} orders</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-2">Order no.</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {orderRows.map((order) => (
              <tr key={order.id} className="border-b border-slate-50 last:border-b-0">
                <td className="px-4 py-2 font-medium text-slate-900">
                  {order.orderNo}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {customerName.get(order.customerId ?? 0) ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      statusStyles[order.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">${order.total}</td>
                <td className="px-4 py-2 text-slate-500">
                  {order.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
