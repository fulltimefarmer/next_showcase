// ============================================================================
// 【Next.js 知识点】React 19 Server Action — 配合 useActionState
// ============================================================================
// 1. useActionState(action, initialState) 的 action 签名是 (prevState, formData) => newState
// 2. <form action={formAction}> 提交时，React 自动把 FormData 传给 action
// 3. 返回值 state 可直接渲染，无需手写 useState + try/catch
// ============================================================================

"use server";

export type CommentState = { message: string };

export async function submitComment(
  _prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
  const name = (formData.get("name") as string) || "";
  // 模拟慢请求（1 秒延迟），观察 useFormStatus 的 pending 状态
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!name.trim()) {
    return { message: "名称不能为空" };
  }
  return { message: `已提交评论：${name}` };
}
