import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { ProductsManager } from "./products-manager";

export const metadata: Metadata = { title: "Products - maxopc" };

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [productRows, categoryRows] = await Promise.all([
    db.select().from(products).orderBy(asc(products.name)),
    db.select().from(categories).orderBy(asc(categories.sort)),
  ]);
  return <ProductsManager products={productRows} categories={categoryRows} />;
}
