"use server";

import { asc, eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { categories, products, skus } from "@/lib/db/schema";

export async function getCategories() {
  await ensureSchema();
  return db.select().from(categories).orderBy(asc(categories.sort));
}

export async function getProducts() {
  await ensureSchema();
  const [productRows, skuRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(asc(products.name)),
    db.select({ productId: skus.productId, price: skus.price }).from(skus),
  ]);

  const minPrice = new Map<number, number>();
  for (const sku of skuRows) {
    const current = minPrice.get(sku.productId);
    if (current === undefined || sku.price < current) {
      minPrice.set(sku.productId, sku.price);
    }
  }

  return productRows.map((product) => ({
    ...product,
    minPrice: minPrice.get(product.id) ?? 0,
  }));
}

export async function getProductBySlug(slug: string) {
  await ensureSchema();
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));
  if (!product) return null;

  const skuRows = await db
    .select()
    .from(skus)
    .where(eq(skus.productId, product.id))
    .orderBy(asc(skus.id));

  return { product, skus: skuRows };
}
