// ============================================================================
// 【Next.js 知识点】Server Action 中做服务端 Zod 校验
// ============================================================================
// 1. 客户端校验（react-hook-form + zodResolver）只是体验优化，可被绕过
// 2. 服务端必须复用同一个 Zod schema 二次校验 —— 这是安全底线
// 3. 推荐返回「结果对象」而非 throw，便于表单直接展示服务端错误
// ============================================================================

"use server";

import { z } from "zod";

// 同一个 schema：客户端（form.tsx）与服务端（本文件）共享
export const employeeSchema = z.object({
  name: z.string().min(2, "名称至少 2 个字符"),
  email: z.string().email("邮箱格式不正确"),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export type ActionResult =
  | { success: true; data: EmployeeInput }
  | { success: false; errors: Record<string, string[]> };

export async function createEmployee(data: unknown): Promise<ActionResult> {
  // safeParse 不会抛错，返回成功/失败结果
  const parsed = employeeSchema.safeParse(data);

  if (!parsed.success) {
    // flatten().fieldErrors 把错误转成 { name: ["..."], email: ["..."] }
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  // 正常流程：这里写数据库 + revalidatePath（本 demo 省略，仅演示校验）
  return { success: true, data: parsed.data };
}
