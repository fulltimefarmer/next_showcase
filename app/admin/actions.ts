"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { categories, products, skus } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

async function requireAdmin() {
  await ensureSchema();
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) throw new Error("Forbidden");
  return user;
}

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function saveCategory(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const name = str(formData.get("name"));
  const slug = str(formData.get("slug"));
  if (!name || !slug) return { error: "Name and slug are required." };
  const description = str(formData.get("description")) || null;
  const sort = Number(formData.get("sort") ?? 0) || 0;

  if (id) {
    await db
      .update(categories)
      .set({ name, slug, description, sort })
      .where(eq(categories.id, id));
  } else {
    await db.insert(categories).values({ name, slug, description, sort });
  }
  revalidatePath("/admin/categories");
  return {};
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) {
    const related = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);
    if (related.length > 0) {
      throw new Error("Cannot delete a category that still has products.");
    }
    await db.delete(categories).where(eq(categories.id, id));
  }
  revalidatePath("/admin/categories");
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function saveProduct(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const productId = str(formData.get("productId"));
  const name = str(formData.get("name"));
  const slug = str(formData.get("slug"));
  if (!productId || !name || !slug) {
    return { error: "Product ID, name and slug are required." };
  }
  const description = str(formData.get("description")) || null;
  const imageUrl = str(formData.get("imageUrl")) || null;
  const status = str(formData.get("status")) || "draft";
  const categoryId = Number(formData.get("categoryId")) || null;

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.productId, productId));
  if (existing && existing.id !== id) {
    return { error: `Product ID "${productId}" is already in use.` };
  }

  if (id) {
    await db
      .update(products)
      .set({ productId, name, slug, description, imageUrl, status, categoryId })
      .where(eq(products.id, id));
  } else {
    await db
      .insert(products)
      .values({ productId, name, slug, description, imageUrl, status, categoryId });
  }
  revalidatePath("/admin/products");
  return {};
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
}

// ---------------------------------------------------------------------------
// Inventory (SKUs)
// ---------------------------------------------------------------------------

export async function saveSku(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const productId = Number(formData.get("productId"));
  const skuId = str(formData.get("skuId"));
  if (!productId || !skuId) return { error: "Product and SKU ID are required." };
  const price = Number(formData.get("price") ?? 0) || 0;
  const stock = Number(formData.get("stock") ?? 0) || 0;
  const imageUrl = str(formData.get("imageUrl")) || null;

  if (id) {
    const [current] = await db.select().from(skus).where(eq(skus.id, id));
    if (!current) return { error: "SKU not found." };
    const [existing] = await db
      .select({ id: skus.id })
      .from(skus)
      .where(and(eq(skus.productId, current.productId), eq(skus.skuId, skuId)));
    if (existing && existing.id !== id) {
      return { error: `SKU ID "${skuId}" already exists for this product.` };
    }
    await db
      .update(skus)
      .set({ skuId, price, stock, imageUrl })
      .where(eq(skus.id, id));
  } else {
    const [existing] = await db
      .select({ id: skus.id })
      .from(skus)
      .where(and(eq(skus.productId, productId), eq(skus.skuId, skuId)));
    if (existing) {
      return { error: `SKU ID "${skuId}" already exists for this product.` };
    }
    await db
      .insert(skus)
      .values({ productId, skuId, price, stock, attributes: {}, imageUrl });
  }
  revalidatePath("/admin/inventory");
  return {};
}

export async function deleteSku(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await db.delete(skus).where(eq(skus.id, id));
  revalidatePath("/admin/inventory");
}
