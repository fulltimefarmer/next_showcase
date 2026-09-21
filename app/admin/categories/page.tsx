import type { Metadata } from "next";
import { asc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { CategoriesManager } from "./categories-manager";

export const metadata: Metadata = { title: "Categories - maxopc" };

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categoryRows, productCountRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort)),
    db
      .select({ categoryId: products.categoryId, total: count() })
      .from(products)
      .groupBy(products.categoryId),
  ]);

  const productCountByCategory = new Map<number, number>();
  for (const row of productCountRows) {
    if (row.categoryId != null) productCountByCategory.set(row.categoryId, row.total);
  }

  return (
    <CategoriesManager
      categories={categoryRows}
      productCountByCategory={productCountByCategory}
    />
  );
}
