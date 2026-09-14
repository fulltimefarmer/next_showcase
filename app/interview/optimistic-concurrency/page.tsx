// ============================================================================
// 【Next.js 知识点】乐观锁客户端演示页
// ============================================================================

"use client";

import { useState } from "react";
import { getDoc, updateDoc } from "./actions";

export default function OptimisticConcurrencyDemoPage() {
  const [doc, setDoc] = useState<{ id: number; title: string; version: number } | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setDoc(await getDoc());
    setMessage("");
  }

  async function save() {
    if (!doc) return;
    const result = await updateDoc(title, doc.version);
    if (result.ok) {
      setDoc(result.current);
      setTitle("");
      setMessage("保存成功，版本 +1");
    } else {
      setDoc(result.current);
      setMessage(result.message);
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">乐观锁并发控制</h1>
      <p className="mb-6 text-sm text-slate-500">
        更新时校验版本号；版本不匹配说明被他人改过，拒绝更新并提示刷新。
      </p>

      <div className="mb-6 flex gap-2">
        <button onClick={load} className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700">
          读取文档
        </button>
      </div>

      {doc && (
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">文档 ID：{doc.id}</p>
          <p className="text-lg font-semibold text-slate-900">{doc.title}</p>
          <p className="text-xs text-slate-400">当前版本 v{doc.version}</p>

          <div className="mt-4 flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="新标题"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              保存（带 v{doc.version}）
            </button>
          </div>
          {message && (
            <p className={`mt-3 text-sm ${message.startsWith("保存") ? "text-emerald-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      )}

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`if (doc.version !== expectedVersion) {
  return { ok: false, message: "版本冲突，请刷新后重试" };
}
doc = { ...doc, title, version: doc.version + 1 };`}
      </pre>
    </div>
  );
}
