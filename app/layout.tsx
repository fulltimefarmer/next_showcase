// ============================================================================
// 【Next.js 知识点】RootLayout — 根布局
// ============================================================================
// 1. 这是整个应用的根布局组件，所有页面都会被包裹在这个布局中
// 2. metadata 导出用于 SEO，Next.js 会自动生成 <title> 和 <meta> 标签
// 3. next/font/google 用于自动优化 Google Fonts 加载（无外部请求，CLS=0）
//    - variable 属性生成 CSS 变量，方便在 Tailwind 中使用
// 4. children 是页面内容，由 Next.js 自动传入，无法手动控制
// ============================================================================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// 【Next.js】next/font/google: 自动 self-host Google Fonts，零外部请求
// 在构建时下载字体文件，避免运行时 Google 请求，提升性能和隐私
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 【Next.js】Metadata API: 导出 metadata 对象，Next.js 自动注入 <head>
// 支持 static metadata（这里）和 dynamic metadata（generateMetadata 函数）
export const metadata: Metadata = {
  title: "Company Management System",
  description: "Internal company management platform",
};

// 【Next.js】RootLayout: 必须接收 children prop，这是 App Router 的核心约定
// 这个组件在服务端渲染，修改后所有页面都会重新渲染
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 【Next.js】html 和 body 标签需要在根布局中定义（Next.js 不会自动添加）
    // 字体 CSS 变量通过 className 注入，配合 Tailwind v4 的 @theme inline 使用
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50">
        {/* 【Next.js】Providers 是客户端组件包装器，用于注入 React Context */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
