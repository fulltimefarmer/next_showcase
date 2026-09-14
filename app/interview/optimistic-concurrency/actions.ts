// ============================================================================
// 【Next.js 知识点】乐观锁并发控制（Optimistic Concurrency）
// ============================================================================
// 1. 思路：每条记录带 version 版本号，更新时校验「我读到的版本 == 当前版本」
// 2. 版本不匹配 → 说明期间被他人修改 → 返回冲突，提示刷新重试
// 3. 对比悲观锁（SELECT ... FOR UPDATE）：乐观锁不加锁、吞吐高，适合读多写少
// 4. 本 demo 用模块级状态模拟一条共享文档（dev 单进程有效，同 concepts-store 说明）
// ============================================================================

"use server";

type Doc = { id: number; title: string; version: number };

// 模拟一条会被并发修改的共享文档
let doc: Doc = { id: 1, title: "Shared Document", version: 1 };

export async function getDoc() {
  return doc;
}

export type UpdateResult =
  | { ok: true; current: Doc }
  | { ok: false; current: Doc; message: string };

/**
 * 乐观锁更新：调用方必须带上「它读到的版本号 expectedVersion」
 * 若不匹配则拒绝更新（并发冲突）
 */
export async function updateDoc(title: string, expectedVersion: number): Promise<UpdateResult> {
  if (doc.version !== expectedVersion) {
    return {
      ok: false,
      current: doc,
      message: `版本冲突：你基于 v${expectedVersion} 编辑，但当前已是 v${doc.version}，请刷新后重试`,
    };
  }
  doc = { ...doc, title, version: doc.version + 1 };
  return { ok: true, current: doc };
}
