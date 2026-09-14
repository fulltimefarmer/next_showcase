// ============================================================================
// 【Next.js 知识点】A/B 测试 — 服务端读取变体 Cookie
// ============================================================================
// 1. cookies() 来自 next/headers，服务端读取请求 Cookie（Next 15+ 返回 Promise）
// 2. 根据变体渲染不同 UI；真实场景由 middleware 按比例写入变体 Cookie
// ============================================================================

import { cookies } from "next/headers";
import { VariantSwitcher } from "./variant-switcher";

export default async function AbTestDemoPage() {
  const store = await cookies();
  const variant = store.get("ab_variant")?.value ?? "a";

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">A/B 测试（Cookie 分流）</h1>
      <p className="mb-6 text-sm text-slate-500">
        服务端读取 ab_variant Cookie，渲染不同版本的 UI。切换后刷新观察变化。
      </p>

      <div className="mb-6">
        <VariantSwitcher />
      </div>

      {variant === "a" ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-blue-700">A 版界面</h2>
          <p className="text-sm text-blue-600">这是变体 A（控制组），展示原始布局。</p>
        </div>
      ) : (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
          <h2 className="text-lg font-semibold text-indigo-700">B 版界面</h2>
          <p className="text-sm text-indigo-600">这是变体 B（实验组），展示新布局。</p>
        </div>
      )}

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`const store = await cookies();
const variant = store.get("ab_variant")?.value ?? "a";
// 生产环境：middleware 按比例 set cookie，此处按 variant 渲染`}
      </pre>
    </div>
  );
}
