// ============================================================================
// 【Next.js 知识点】i18n 入口页 — 选择语言
// ============================================================================

import Link from "next/link";

export default function I18nIndexPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">简单 i18n 国际化</h1>
      <p className="mb-6 text-sm text-slate-500">
        用 [locale] 动态路由段 + 翻译字典演示国际化（无外部依赖）。选择语言查看对应页面。
      </p>
      <div className="flex gap-2">
        <Link href="/interview/i18n/zh" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          中文（/zh）
        </Link>
        <Link href="/interview/i18n/en" className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700">
          English（/en）
        </Link>
      </div>
    </div>
  );
}
