import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, skus } from "@/lib/db/schema";
import { InventoryManager } from "./inventory-manager";

export const metadata: Metadata = { title: "Inventory - maxopc" };

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [skuRows, productRows] = await Promise.all([
    db.select().from(skus).orderBy(asc(skus.id)),
    db.select().from(products).orderBy(asc(products.name)),
  ]);
  return <InventoryManager skus={skuRows} products={productRows} />;
}
