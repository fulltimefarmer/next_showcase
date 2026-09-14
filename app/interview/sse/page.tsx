// ============================================================================
// 【Next.js 知识点】SSE 客户端演示页 — EventSource 订阅
// ============================================================================

"use client";

import { useEffect, useState } from "react";

export default function SseDemoPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [listening, setListening] = useState(true);

  useEffect(() => {
    const es = new EventSource("/interview/sse");

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, `${data.time}  →  第 ${data.count} 条`]);
    };
    es.onerror = () => {
      es.close();
      setListening(false);
    };

    return () => es.close();
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">SSE 实时推送</h1>
      <p className="mb-6 text-sm text-slate-500">
        Route Handler 返回 text/event-stream，客户端 EventSource 接收。每秒推送一条，共 5 条。
      </p>

      <div className="mb-4">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${listening ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {listening ? "● 订阅中" : "○ 已断开"}
        </span>
      </div>

      <ul className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        {messages.length === 0 && <li className="text-sm text-slate-400">等待推送...</li>}
        {messages.map((m, i) => (
          <li key={i} className="text-sm text-slate-700">{m}</li>
        ))}
      </ul>

      <pre className="mt-6 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`const es = new EventSource("/interview/sse");
es.onmessage = (e) => console.log(JSON.parse(e.data));`}
      </pre>
    </div>
  );
}
