"use server";

import { db, ensureSchema } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export type CheckoutItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

function generateOrderNo(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}`;
  const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `OPC-${timestamp}${rand}`;
}

export async function createOrder(
  items: CheckoutItem[],
  total: number,
  email: string,
): Promise<{ orderNo: string }> {
  await ensureSchema();
  if (!items.length) throw new Error("Cart is empty.");

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  const user = await getCurrentUser();
  const orderNo = generateOrderNo();

  const [order] = await db
    .insert(orders)
    .values({
      orderNo,
      status: "paid",
      total,
      userId: user?.id ?? null,
      email: normalizedEmail,
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
  );

  return { orderNo };
}
