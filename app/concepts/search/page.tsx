// ============================================================================
// 【Next.js 知识点 · 新增案例】URL Search Params 驱动筛选
// ============================================================================
// 1. 服务端读取：Server Component 通过 props.searchParams 读取查询参数
//    （Next.js 15+ 中 searchParams 是 Promise，需要 await）
// 2. 客户端读取：useSearchParams() hook（见 filter-bar.tsx）
// 3. 用 URL 查询参数（?status=active）做筛选的好处：
//    - 状态可分享（复制链接给别人看到同样的筛选结果）
//    - 可回退/前进（浏览器历史记录）
//    - 可被搜索引擎索引
//    - 对比：用 useState 管理的筛选状态无法被分享和回退
// ============================================================================

import { Suspense } from "react";
import { FilterBar } from "./filter-bar";

// 模拟数据
const ITEMS = [
  { id: 1, name: "Server A", status: "active" },
  { id: 2, name: "Server B", status: "active" },
  { id: 3, name: "Server C", status: "inactive" },
  { id: 4, name: "Server D", status: "maintenance" },
];

export default async function SearchDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // 【Next.js】服务端读取 URL 查询参数（如 /concepts/search?status=active）
  const { status } = await searchParams;

  const filtered = status
    ? ITEMS.filter((i) => i.status === status)
    : ITEMS;

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        useSearchParams URL 筛选
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        用 URL 查询参数 ?status=xxx 驱动列表筛选。当前筛选：
        <span className="font-semibold text-slate-900">
          {status ?? "全部 (all)"}
        </span>
      </p>

      {/* 客户端筛选按钮：用 useSearchParams + Link 修改查询参数 */}
      <Suspense fallback={<p className="text-sm text-slate-400">加载筛选器...</p>}>
        <FilterBar />
      </Suspense>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">无匹配项</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 text-sm">
                  <td className="px-4 py-3 font-medium text-slate-900">{i.name}</td>
                  <td className="px-4 py-3 text-slate-500">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
