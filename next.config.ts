import type { NextConfig } from "next";

// ============================================================================
// 【Next.js 知识点】images.remotePatterns — 允许 next/image 加载的远程图片域名
// ============================================================================
// 1. 默认 next/image 只能加载同源图片；加载远程图片必须显式声明域名
// 2. 这是安全机制：防止 SSRF / 图片代理被滥用
// 3. 本配置允许 images.unsplash.com，用于 concepts/image 案例演示
// ============================================================================
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
