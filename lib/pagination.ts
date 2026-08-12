"use server";

/**
 * 通用分页查询工具
 *
 * 特性演示：
 * - Server Action 中直接使用
 * - 使用 Drizzle ORM 的 offset/limit + count 实现
 * - 利用 Next.js URL searchParams 保持分页状态在 URL 中
 */

import { db } from "@/lib/db";

export const DEFAULT_PAGE_SIZE = 10;

export async function paginatedQuery<T extends Record<string, unknown>>(
  tableName: string,
  queryBuilder: (db: typeof import("@/lib/db").db) => Promise<T[]>,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<{ data: T[]; total: number; page: number; pageSize: number }> {
  const all = await queryBuilder(db);
  const total = all.length;
  const data = all.slice((page - 1) * pageSize, page * pageSize);
  return { data, total, page, pageSize };
}
