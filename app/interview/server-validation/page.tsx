import { EmployeeForm } from "./form";

export default function ServerValidationDemoPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">服务端 Zod 校验</h1>
      <p className="mb-6 text-sm text-slate-500">
        客户端校验可被绕过，服务端必须复用同一 Zod schema 二次校验。
        输入非法邮箱（如 &quot;abc&quot;）提交，观察服务端返回的错误回填到表单。
      </p>
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6">
        <EmployeeForm />
      </div>
    </div>
  );
}
