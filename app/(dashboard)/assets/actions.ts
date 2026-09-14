// ============================================================================
// 【Next.js 知识点】Server Actions — 资产管理
// ============================================================================
// 1. 与 departments 相同的标准 CRUD 模式（"use server" + revalidatePath）
// 2. 本模块的知识点:
//    - assignedTo 外键关联 employees 表（"使用人"下拉框）
//    - status 字段是字符串状态机: available → in_use / maintenance
//      （状态流转在客户端 asset-list.tsx 中通过 select 选择，比 enum 更灵活）
//    - 跨模块数据依赖: page.tsx 需要同时加载 assets + employees
// ============================================================================

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
