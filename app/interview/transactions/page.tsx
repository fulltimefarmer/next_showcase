// ============================================================================
// 【Next.js 知识点】Drizzle 事务客户端演示页
// ============================================================================

"use client";

import { useState } from "react";
import { getDepartmentCount, runTransactionDemo } from "./actions";

export default function TransactionsDemoPage() {
  const [result, setResult] = useState<{ before: number; after: number; rolledBack: boolean } | null>(null);
  const [count, setCount] = useState<number | null>(null);

  async function refreshCount() {
    setCount(await getDepartmentCount());
  }

  async function run() {
    setResult(await runTransactionDemo());
    setCount(await getDepartmentCount());
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Drizzle 事务（transaction）</h1>
      <p className="mb-6 text-sm text-slate-500">
        事务内插入两行后抛错 → 自动回滚。观察 before 与 after 数量一致，说明数据未污染。
      </p>

      <div className="mb-6 flex gap-2">
        <button onClick={run} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          运行事务回滚演示
        </button>
        <button onClick={refreshCount} className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700">
          刷新部门数量
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">事务前后部门数量：</p>
          <p className="text-lg font-semibold text-slate-900">
            前 {result.before} 条 → 后 {result.after} 条
          </p>
          <p className={`mt-2 text-sm font-medium ${result.rolledBack ? "text-emerald-600" : "text-red-600"}`}>
            {result.rolledBack ? "✓ 已回滚，数据未污染" : "✗ 异常：数据被写入"}
          </p>
        </div>
      )}

      {count !== null && (
        <p className="mt-4 text-sm text-slate-500">当前 departments 表共 {count} 条记录。</p>
      )}

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`await db.transaction(async (tx) => {
  await tx.insert(departments).values({ name: "TxDemo-A" });
  await tx.insert(departments).values({ name: "TxDemo-B" });
  throw new Error("触发 rollback"); // 回滚 → 上面两行不生效
});`}
      </pre>
    </div>
  );
}
