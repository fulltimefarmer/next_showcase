// ============================================================================
// 【Next.js 知识点】Server Actions — "use server" 数据操作
// ============================================================================
// 1. "use server" 标记这个文件中的所有导出函数都是 Server Actions
//    - 它们只在服务端执行，浏览器不会看到任何代码
//    - 可以在客户端组件中直接调用（Next.js 自动创建 POST 请求）
//    - 不需要手动创建 API Route — 这是 Next.js 最大的简化之一
// 2. revalidatePath(path): 服务端缓存失效
//    - 调用后，Next.js 会重新获取指定路径的页面数据
//    - 这是 Next.js 缓存策略的核心 — 按需失效，而非全量刷新
//    - 与 Pages Router 的 getServerSideProps 每次请求都重新获取不同
// 3. Server Action 函数可以在任何地方被调用:
//    - Server Component: 直接 import 调用
//    - Client Component: import 后像普通函数一样调用（Next.js 自动处理网络请求）
// ============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** 获取所有部门 — 只读操作，用于 Server Component 和 Client Component 刷新 */
export async function getDepartments() {
  await ensureSchema();
  return db.select().from(departments).orderBy(departments.name);
}

/** 新增部门 — 写操作，写入数据库后触发缓存失效 */
export async function createDepartment(data: { name: string; description?: string }) {
  await ensureSchema();
  await db.insert(departments).values({
    name: data.name,
    description: data.description || null,
  });
  // 【Next.js】revalidatePath: 关键！
  // 不调用的话页面不会更新 — Next.js 会返回缓存的旧数据
  // 只重新验证指定路径，不会影响其他页面
  revalidatePath("/departments");
}

export async function updateDepartment(id: number, data: { name: string; description?: string }) {
  await ensureSchema();
  await db
    .update(departments)
    .set({ name: data.name, description: data.description || null })
    .where(eq(departments.id, id));
  revalidatePath("/departments");
}

export async function deleteDepartment(id: number) {
  await ensureSchema();
  await db.delete(departments).where(eq(departments.id, id));
  revalidatePath("/departments");
}
