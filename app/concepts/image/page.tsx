// ============================================================================
// 【Next.js 知识点 · 新增案例】next/image 图片优化
// ============================================================================
// 1. next/image 是 Next.js 内置的图片组件，替代原生 <img>
// 2. 自动优化能力：
//    - 按设备/视口自动生成合适尺寸（sizes + srcset）
//    - 自动转 WebP/AVIF 格式（减小体积）
//    - 懒加载（默认 loading="lazy"）
//    - 防止布局偏移（CLS，需提供 width/height 或 fill）
// 3. 远程图片必须先配置 remotePatterns（next.config.ts）指定允许的域名
// 4. 本地图片用静态 import 可获得自动宽高推断
// ============================================================================

import Image from "next/image";

export default function ImageDemoPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        next/image 图片优化
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        使用内置 Image 组件替代原生 &lt;img&gt;，自动做格式转换、懒加载、尺寸优化。
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* 固定尺寸：指定 width/height，防止布局偏移（CLS=0） */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            固定尺寸（width/height）
          </h2>
          <Image
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80"
            alt="Programming laptop"
            width={600}
            height={400}
            className="h-auto w-full rounded-md"
          />
        </div>

        {/* 填充容器：fill + 父容器定位，用于响应式布局 */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            填充容器（fill）
          </h2>
          <div className="relative h-64 w-full overflow-hidden rounded-md">
            <Image
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"
              alt="Code on screen"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <p className="font-medium">配置说明</p>
        <p className="mt-1">
          远程图片需在 next.config.ts 中配置 remotePatterns 允许 images.unsplash.com。
          本地图片（public/ 目录或静态 import）无需额外配置。
        </p>
      </div>
    </div>
  );
}
