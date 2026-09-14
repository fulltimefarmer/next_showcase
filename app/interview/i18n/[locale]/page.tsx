// ============================================================================
// 【Next.js 知识点】i18n 演示 — [locale] 动态路由段 + 翻译字典
// ============================================================================
// 1. [locale] 动态段：通过 params.locale 获取当前语言
// 2. 翻译字典：按 locale 取值，未知 locale 回退到默认语言
// 3. 生产环境常用 next-intl / react-i18next，这里仅演示核心思路
// ============================================================================

import Link from "next/link";

const dict: Record<string, { greeting: string; desc: string; home: string }> = {
  zh: { greeting: "你好，世界！", desc: "这是一个国际化演示页面。", home: "返回首页" },
  en: { greeting: "Hello, World!", desc: "This is an i18n demo page.", home: "Back home" },
};

export default async function I18nDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = dict[locale] ?? dict.en;

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">i18n（当前 locale: {locale}）</h1>
      <p className="mb-6 text-sm text-slate-500">{t.desc}</p>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-xl font-semibold text-slate-900">{t.greeting}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href="/interview/i18n/zh" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">中文</Link>
        <Link href="/interview/i18n/en" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">English</Link>
        <Link href="/interview" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">{t.home}</Link>
      </div>

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`const { locale } = await params;          // [locale] 动态段
const t = dict[locale] ?? dict.en;          // 回退默认语言`}
      </pre>
    </div>
  );
}
