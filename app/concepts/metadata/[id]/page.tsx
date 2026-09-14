// ============================================================================
// 【Next.js 知识点 · 新增案例】generateMetadata — 动态 SEO
// ============================================================================
// 1. 静态 metadata：export const metadata = { title: "..." }（见 app/layout.tsx）
// 2. 动态 metadata：export async function generateMetadata({ params, searchParams })
//    - 返回 Metadata 对象，可在其中根据参数动态生成 title/description/OG 标签
//    - 在 Server Component 中运行，可以查数据库后再决定标题
// 3. 本案例根据路由参数 id 动态生成标题 —— 每个资源页有独立的 SEO 信息
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";

const RESOURCES: Record<string, { name: string; desc: string }> = {
  "42": { name: "The Hitchhiker's Guide", desc: "关于 42 的宇宙终极答案" },
  "7": { name: "Seven", desc: "关于数字 7 的页面" },
};

// 【Next.js】generateMetadata：动态生成 <title> 和 <meta>
// 浏览器标签页标题、搜索引擎摘要、社交分享卡片都会用到这些信息
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = RESOURCES[id];

  return {
    title: item ? `${item.name} | Concepts` : "Unknown | Concepts",
    description: item?.desc ?? "未找到该资源",
    // Open Graph：社交分享（微信/Twitter/Facebook）时展示的标题和描述
    openGraph: {
      title: item?.name ?? "Unknown",
      description: item?.desc,
    },
  };
}

export default async function MetadataDemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = RESOURCES[id];

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        generateMetadata 动态 SEO
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        当前 id = {id}。查看浏览器标签页标题（已由 generateMetadata 动态生成）。
        可手动改 URL 为 /concepts/metadata/42 或 /7 观察标题变化。
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {item?.name ?? "Unknown Resource"}
        </h2>
        <p className="text-sm text-slate-500">{item?.desc ?? "未找到该资源"}</p>
      </div>

      <div className="mt-6 space-x-2">
        <Link href="/concepts/metadata/42" className="text-sm text-blue-600 hover:underline">
          查看 id=42
        </Link>
        <Link href="/concepts/metadata/7" className="text-sm text-blue-600 hover:underline">
          查看 id=7
        </Link>
      </div>
    </div>
  );
}
