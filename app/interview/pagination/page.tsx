// ============================================================================
// 【Next.js 知识点】searchParams 分页 — Server Component 读取 ?page=
// ============================================================================
// 1. Server Component 通过 props.searchParams 读取查询参数（Next 15+ 是 Promise）
// 2. 分页状态放在 URL 里（?page=2），好处：可分享、可回退、可被搜索引擎索引
// 3. 这里手写 offset/limit 切片；项目里另有通用工具 lib/pagination.ts（paginatedQuery）
// ============================================================================

import Link from "next/link";

const ITEMS = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

const PAGE_SIZE = 5;

export default async function PaginationDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const total = ITEMS.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (pageNum - 1) * PAGE_SIZE;
  const data = ITEMS.slice(start, start + PAGE_SIZE);

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">searchParams 分页</h1>
      <p className="mb-6 text-sm text-slate-500">
        分页状态放在 URL（?page=N）中，可分享、可回退。当前第 {pageNum} / {totalPages} 页。
      </p>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
            </tr>
          </thead>
          <tbody>
            {data.map((i) => (
              <tr key={i.id} className="border-b border-slate-100 text-sm">
                <td className="px-4 py-3 text-slate-500">{i.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{i.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/interview/pagination?page=${Math.max(1, pageNum - 1)}`}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            pageNum <= 1 ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          ← 上一页
        </Link>
        <span className="text-sm text-slate-500">第 {pageNum} / {totalPages} 页</span>
        <Link
          href={`/interview/pagination?page=${Math.min(totalPages, pageNum + 1)}`}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            pageNum >= totalPages ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          下一页 →
        </Link>
      </div>

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`const page = Number(searchParams.get("page") ?? 1);
const data = await db.select().from(t)
  .limit(pageSize).offset((page - 1) * pageSize);`}
      </pre>
    </div>
  );
}
