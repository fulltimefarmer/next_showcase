// ============================================================================
// 【Next.js 知识点 · 新增案例】Route Handlers 调用演示页
// ============================================================================
// 1. 客户端用原生 fetch 调用 route.ts 定义的 API（与调第三方 API 完全一致）
// 2. 演示 GET（列表/查询参数）、POST（创建）、PUT（更新）、DELETE（删除）
// 3. Route Handler 适合：对接外部 Webhook、暴露公开 API、移动端复用后端逻辑
//    - 若只是页面内部的数据操作，优先用 Server Actions（更简洁）
// ============================================================================

"use client";

import { useState } from "react";

type Item = { id: number; name: string };
type ListResp = { items: Item[]; meta?: { userAgent?: string; visitor?: string } };

export default function RouteHandlersDemoPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState<ListResp["meta"]>({});
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  async function loadList() {
    setStatus("loading list...");
    const res = await fetch("/concepts/api");
    const data: ListResp = await res.json();
    setItems(data.items);
    setMeta(data.meta);
    setStatus("ok");
  }

  async function loadFiltered() {
    setStatus("loading filtered...");
    const res = await fetch("/concepts/api?keyword=a");
    const data: ListResp = await res.json();
    setItems(data.items);
    setStatus("ok (keyword=a)");
  }

  async function create() {
    if (!name.trim()) return;
    setStatus("creating...");
    const res = await fetch("/concepts/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const item: Item = await res.json();
    setName("");
    setStatus(`created #${item.id}`);
    await loadList();
  }

  async function update(id: number) {
    setStatus(`updating #${id}...`);
    const res = await fetch(`/concepts/api/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${name || "Renamed"} (updated)` }),
    });
    await res.json();
    setStatus(`updated #${id}`);
    await loadList();
  }

  async function remove(id: number) {
    setStatus(`deleting #${id}...`);
    await fetch(`/concepts/api/${id}`, { method: "DELETE" });
    setStatus(`deleted #${id}`);
    await loadList();
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Route Handlers 完整 CRUD
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        用原生 fetch 调用 route.ts 定义的 API（GET/POST/PUT/DELETE + 动态参数）。
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={loadList} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          GET 列表
        </button>
        <button onClick={loadFiltered} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          GET ?keyword=a
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="新项名称"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button onClick={create} className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">
          POST 创建
        </button>
      </div>

      {status && (
        <p className="mb-4 text-xs text-slate-400">最近操作：{status}</p>
      )}

      {meta && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <p>请求头 User-Agent：{meta.userAgent ?? "—"}</p>
          <p>Cookie visitor：{meta.visitor ?? "—"}</p>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-2">
            <span className="text-sm text-slate-700">
              #{i.id} {i.name}
            </span>
            <div className="space-x-2">
              <button onClick={() => update(i.id)} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                PUT 更新
              </button>
              <button onClick={() => remove(i.id)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                DELETE
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
