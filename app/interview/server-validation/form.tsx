// ============================================================================
// 【Next.js 知识点】服务端 + 客户端双重校验表单
// ============================================================================
// 1. 客户端：react-hook-form + zodResolver 即时反馈（体验）
// 2. 服务端：submit 时调用 Server Action，复用同一 schema 二次校验（安全）
//    —— 即使绕过客户端校验直接发请求，服务端仍会拦截
// ============================================================================

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEmployee, employeeSchema, type EmployeeInput } from "./actions";

export function EmployeeForm() {
  const form = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: "", email: "" },
  });

  async function onSubmit(values: EmployeeInput) {
    // 服务端二次校验（同一 schema）
    const result = await createEmployee(values);
    if (!result.success) {
      // 把服务端错误回填到对应字段
      if (result.errors.name) form.setError("name", { message: result.errors.name[0] });
      if (result.errors.email) form.setError("email", { message: result.errors.email[0] });
      toast.error("服务端校验失败");
    } else {
      toast.success("提交成功");
      form.reset();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Name（至少 2 字符）</label>
        <input
          {...form.register("name")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email（合法邮箱）</label>
        <input
          {...form.register("email")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
