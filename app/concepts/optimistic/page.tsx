// ============================================================================
// 【Next.js 知识点 · 新增案例】useOptimistic — 乐观更新 (React 19)
// ============================================================================
// 1. useOptimistic 用于「乐观更新」：提交后立即更新 UI，无需等服务器响应
//    - 表单提交后，新项立即出现在列表（带「提交中」标记）
//    - Server Action 返回真实结果后，用真实数据替换乐观数据
//    - 若失败则回滚到提交前状态
// 2. 对比传统做法：先 await Server Action 再 setState —— 用户会看到明显延迟
// 3. useOptimistic 是 React 19 的新 hook，与 Server Action 搭配是官方推荐模式
// ============================================================================

"use client";

import { useState, useOptimistic, useRef } from "react";
import { addItem } from "./actions";

const initialItems = ["学习 Next.js 路由", "学习 Server Actions"];

export default function OptimisticDemoPage() {
  const [items, setItems] = useState(initialItems);
  const formRef = useRef<HTMLFormElement>(null);

  // 【React 19】useOptimistic(state, reducer)
  // optimisticItems = 立即更新后的列表；addOptimistic = 触发乐观更新
  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (current, text: string) => [...current, text]
  );

  async function formAction(formData: FormData) {
    const text = (formData.get("text") as string) || "";
    if (!text.trim()) return;

    // 1. 乐观更新：立即把新项加到列表（带 pending 标记）
    addOptimistic(text);

    // 2. 清空输入框（不受 Server Action 影响，立即执行）
    formRef.current?.reset();

    // 3. 调用 Server Action（模拟 1.5 秒延迟），拿到真实结果后替换
    const next = await addItem(items, text);
    setItems(next);
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        useOptimistic 乐观更新
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        提交后新项立即出现（乐观），1.5 秒后服务端确认。体验「无延迟」的交互。
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mb-6 flex gap-2"
      >
        <input
          name="text"
          placeholder="输入待办事项..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {optimisticItems.map((item, idx) => (
          <li
            key={idx}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
          >
            {item}
            {/* 乐观更新中的项（还在服务端确认中）显示 pending 标记 */}
            {!items.includes(item) && (
              <span className="ml-2 text-xs text-amber-600">提交中...</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
