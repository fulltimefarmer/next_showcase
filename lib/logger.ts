// ============================================================================
// 【Next.js 知识点】结构化日志 — 追踪代码执行链路
// ============================================================================
// 1. 日志级别: debug < info < warn < error
//    - 生产环境只输出 info 及以上，开发环境输出全部
// 2. 每个 logger 绑定一个 scope（模块名），方便定位日志来源
// 3. 通过 Node.js AsyncLocalStorage 传递 traceId（执行链路 ID）
//    - 同一次请求内的所有日志共享同一个 traceId，串起来就是完整调用链
//    - 用 withTrace() 包裹一段执行逻辑，其内部（含 await 之后）的日志都会带上该 traceId
// 4. 零依赖、服务端专用（Server Components / Server Actions / API Routes）
//    - 客户端组件不要引入（会打包 Node 的 async_hooks，导致报错）
// ============================================================================

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_VALUE: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

// 【终端颜色】开发环境下给不同级别上色，方便肉眼区分
const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: "\x1b[90m", // 灰色
  info: "\x1b[36m", // 青色
  warn: "\x1b[33m", // 黄色
  error: "\x1b[31m", // 红色
};
const RESET = "\x1b[0m";

// 最低输出级别：生产环境忽略 debug，开发环境全部输出
const MIN_LEVEL = LEVEL_VALUE[process.env.NODE_ENV === "production" ? "info" : "debug"];
// 输出格式：生产环境输出结构化 JSON（便于日志收集），开发环境输出可读彩色文本
const JSON_MODE = process.env.NODE_ENV === "production" || process.env.LOG_FORMAT === "json";

// ============================================================================
// traceId 上下文
// ============================================================================

interface TraceContext {
  traceId: string;
}

// AsyncLocalStorage 是 Node.js 提供的"异步局部存储"
// 同一个异步调用链上的所有代码都能读到同一个 store，跨 await 依然有效
const asyncContext = new AsyncLocalStorage<TraceContext>();

/**
 * 在指定 traceId 的上下文中执行回调。
 * 回调内部（以及它 await 的子调用）的所有日志都会自动带上该 traceId。
 *
 * 用法:
 *   await withTrace(crypto.randomUUID(), async () => {
 *     logger.info("开始处理"); // 自动带上 traceId
 *     await doSomething();
 *     logger.info("处理完成");
 *   });
 */
export async function withTrace<T>(
  traceId: string,
  fn: () => T | Promise<T>
): Promise<T> {
  return asyncContext.run({ traceId }, fn);
}

/**
 * 生成一个新的 traceId 并在其上下文中执行回调。
 * 适合作为一次请求/一段执行链路的入口。
 */
export async function runWithNewTrace<T>(fn: () => T | Promise<T>): Promise<T> {
  return withTrace(randomUUID(), fn);
}

// ============================================================================
// Logger
// ============================================================================

interface LogMeta {
  [key: string]: unknown;
}

function formatText(
  level: LogLevel,
  scope: string,
  traceId: string | undefined,
  message: string,
  meta: LogMeta
): string {
  const time = new Date().toISOString();
  const color = LEVEL_COLOR[level];
  const levelLabel = level.toUpperCase().padEnd(5);
  const scopeLabel = scope ? `[${scope}] ` : "";
  const traceLabel = traceId ? `(${traceId.slice(0, 8)}) ` : "";
  const metaLabel = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${color}${time} ${levelLabel} ${RESET}${scopeLabel}${traceLabel}${message}${metaLabel}`;
}

function formatJson(
  level: LogLevel,
  scope: string,
  traceId: string | undefined,
  message: string,
  meta: LogMeta
): string {
  return JSON.stringify({
    time: new Date().toISOString(),
    level,
    scope: scope || undefined,
    traceId,
    msg: message,
    ...meta,
  });
}

function write(level: LogLevel, scope: string, message: string, meta: LogMeta) {
  // 低于最低级别的日志直接丢弃，避免噪音
  if (LEVEL_VALUE[level] < MIN_LEVEL) return;

  const traceId = asyncContext.getStore()?.traceId;
  const line = JSON_MODE
    ? formatJson(level, scope, traceId, message, meta)
    : formatText(level, scope, traceId, message, meta);

  // 按级别路由到 console 的对应方法，方便在浏览器/终端按级别过滤
  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "info":
      console.info(line);
      break;
    default:
      console.log(line);
  }
}

/**
 * 创建一个绑定 scope（模块名）的 logger。
 * 用法: const logger = createLogger("lib/db");
 */
export function createLogger(scope: string) {
  return {
    debug(message: string, meta?: LogMeta) {
      write("debug", scope, message, meta ?? {});
    },
    info(message: string, meta?: LogMeta) {
      write("info", scope, message, meta ?? {});
    },
    warn(message: string, meta?: LogMeta) {
      write("warn", scope, message, meta ?? {});
    },
    error(message: string, meta?: LogMeta) {
      write("error", scope, message, meta ?? {});
    },
  };
}

/** 未绑定 scope 的全局 logger（不推荐，优先使用 createLogger 绑定模块名） */
export const logger = createLogger("");
