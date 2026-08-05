"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAssets() {
  await ensureSchema();
  return db.select().from(assets).orderBy(assets.name);
}

export async function createAsset(data: {
  name: string;
  type: string;
  serialNumber?: string;
  status?: string;
  assignedTo?: number | null;
  purchaseDate?: string;
}) {
  await ensureSchema();
  await db.insert(assets).values({
    name: data.name,
    type: data.type,
    serialNumber: data.serialNumber || null,
    status: data.status || "available",
    assignedTo: data.assignedTo || null,
    purchaseDate: data.purchaseDate || null,
  });
  revalidatePath("/assets");
}

export async function updateAsset(
  id: number,
  data: {
    name: string;
    type: string;
    serialNumber?: string;
    status?: string;
    assignedTo?: number | null;
    purchaseDate?: string;
  }
) {
  await ensureSchema();
  await db
    .update(assets)
    .set({
      name: data.name,
      type: data.type,
      serialNumber: data.serialNumber || null,
      status: data.status || "available",
      assignedTo: data.assignedTo || null,
      purchaseDate: data.purchaseDate || null,
    })
    .where(eq(assets.id, id));
  revalidatePath("/assets");
}

export async function deleteAsset(id: number) {
  await ensureSchema();
  await db.delete(assets).where(eq(assets.id, id));
  revalidatePath("/assets");
}
