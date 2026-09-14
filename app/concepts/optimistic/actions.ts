// ============================================================================
// 【Next.js 知识点】Server Action — 配合 useOptimistic
// ============================================================================
// 1. 这是一个 Server Action（"use server"），模拟慢操作（1.5 秒延迟）
// 2. 返回「新的完整列表」，客户端用真实结果替换乐观数据
// 3. 真实场景中，这里会写数据库并 revalidatePath
// ============================================================================

"use server";

export async function addItem(items: string[], text: string): Promise<string[]> {
  // 模拟服务端延迟（数据库写入 / 网络请求）
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 返回拼接后的新列表
  return [...items, text];
}
