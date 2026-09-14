// ============================================================================
// 【Next.js 知识点】Drizzle 事务（transaction）— 原子性演示
// ============================================================================
// 1. db.transaction(async (tx) => { ... })：所有操作在同一事务中
// 2. 事务内任意一步抛错 → 整个事务回滚（all-or-nothing）
// 3. 本 demo 在事务里插入两行后故意抛错，演示「回滚后数据不变」，
//    不会污染 departments 表（因为总是回滚）
// 4. 真实场景：扣库存 + 生成订单 等需要原子性的多步写操作
// ============================================================================

"use server";

import { db, ensureSchema } from "@/lib/db";
import { departments } from "@/lib/db/schema";

export async function getDepartmentCount() {
  await ensureSchema();
  return (await db.select().from(departments)).length;
}

/**
 * 事务回滚演示：插入两行后抛错 → 回滚 → 数据条数不变
 * 返回 { before, after, rolledBack } 供前端展示
 */
export async function runTransactionDemo() {
  await ensureSchema();
  const before = (await db.select().from(departments)).length;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(departments).values({ name: "TxDemo-A" });
      await tx.insert(departments).values({ name: "TxDemo-B" });
      // 中途失败 → 触发回滚，上面两行插入都不会生效
      throw new Error("模拟事务中途失败，触发 rollback");
    });
  } catch {
    // 预期抛出，忽略（用于演示回滚）
  }

  const after = (await db.select().from(departments)).length;
  return { before, after, rolledBack: before === after };
}

// 提交路径示例（本 demo 不执行，仅作对照）：
// await db.transaction(async (tx) => {
//   await tx.insert(departments).values({ name: "A" });
//   await tx.insert(departments).values({ name: "B" });
//   // 正常结束 → 提交，两行都生效
// });
