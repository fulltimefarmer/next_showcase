// ============================================================================
// 【Next.js 知识点】Client Boundary — "use client" 边界
// ============================================================================
// 1. "use client" 标记这是客户端组件，可以使用 hooks、事件处理、浏览器 API
// 2. 这个 Providers 组件是 "客户端边界" — 它把服务端组件树和客户端组件树连接起来
//    所有需要 Context（如 SessionProvider）的组件必须在这个边界内部
// 3. SessionProvider 提供全局的 session 状态，子组件可以用 useSession() 获取
// 4. Toaster 是 sonner 的通知组件，必须在客户端渲染
// ============================================================================

"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // 【Next.js + Auth.js】SessionProvider 来自 next-auth/react
    // 它用 React Context 提供 session 数据，避免在每个页面都 fetch session
    // 底层用 fetch 调用 /api/auth/session 获取数据
    <SessionProvider>
      {children}
      {/* sonner Toaster: 全局通知容器，需要在 Provider 内部以获取样式上下文 */}
      <Toaster richColors position="top-right" />
    </SessionProvider>
  );
}
