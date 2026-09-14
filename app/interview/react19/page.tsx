// ============================================================================
// 【Next.js 知识点】useActionState + useFormStatus 演示页（React 19）
// ============================================================================
// 1. useActionState：管理 Server Action 的返回值 state（替代 useFormState）
// 2. useFormStatus：在「表单子组件」里读取提交中状态，无需 props 钻取
//    —— 注意 useFormStatus 来自 react-dom，且必须在 <form> 内部使用
// ============================================================================

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitComment, type CommentState } from "./actions";

function SubmitButton() {
  // 【React 19】useFormStatus：读取最近一次表单提交的 pending 状态
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "提交中..." : "提交"}
    </button>
  );
}

export default function React19DemoPage() {
  // 【React 19】useActionState：state 是 action 返回值，formAction 传给 <form action>
  const [state, formAction] = useActionState<CommentState, FormData>(submitComment, {
    message: "",
  });

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        useActionState + useFormStatus
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        React 19 表单状态管理：Server Action 返回值直接作为 state 渲染，提交中状态由 useFormStatus 提供。
      </p>

      <form action={formAction} className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">评论者名称</label>
          <input
            name="name"
            placeholder="你的名字"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <SubmitButton />
        {state.message && <p className="text-sm text-slate-700">{state.message}</p>}
      </form>

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`const [state, formAction] = useActionState(submitComment, { message: "" });
<form action={formAction}>
  <input name="name" />
  <SubmitButton />   // 内部 useFormStatus().pending
</form>`}
      </pre>
    </div>
  );
}
