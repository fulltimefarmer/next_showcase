// ============================================================================
// 【Next.js 知识点】Server-Sent Events (SSE) — 实时单向推送
// ============================================================================
// 1. Route Handler 返回 ReadableStream + text/event-stream，实现服务器→客户端流式推送
// 2. SSE 比 WebSocket 更简单（单向、基于 HTTP、自动重连），适合通知/日志等场景
// 3. 客户端用 EventSource API 订阅；需要 force-dynamic 防止被静态缓存
// ============================================================================

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let count = 0;
      const id = setInterval(() => {
        count += 1;
        // SSE 格式：data: <json>\n\n（两个换行表示一条消息结束）
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ time: new Date().toISOString(), count })}\n\n`)
        );
        if (count >= 5) {
          clearInterval(id);
          controller.close();
        }
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
