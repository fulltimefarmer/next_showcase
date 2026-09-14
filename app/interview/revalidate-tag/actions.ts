// ============================================================================
// 【Next.js 知识点】revalidateTag — 按「标签」精细失效缓存
// ============================================================================
// 1. unstable_cache(fn, keyParts, { tags, revalidate })：把函数结果放进 Data Cache，
//    并给这条缓存打上标签 interview-counter
// 2. revalidateTag("interview-counter")：按标签失效 —— 下次调用重新执行 fn
// 3. 对比 revalidatePath：
//    - revalidatePath("/departments")：按路径失效（一条路由）
//    - revalidateTag("tag")：按标签失效（可同时失效多处引用该标签的缓存）
// 4. 本 demo 用模块级 counter 模拟数据源（dev 单进程有效，同 concepts-store 说明）
// ============================================================================

"use server";

import { unstable_cache, revalidateTag } from "next/cache";

// 模拟数据源（真实项目里是数据库查询）
let counter = 0;

/**
 * 读取计数：结果被 unstable_cache 缓存（标签 interview-counter，1 小时）
 * 在缓存被 revalidateTag 失效前，一直返回缓存值
 */
export async function getCachedCounter() {
  return unstable_cache(
    async () => {
      return { value: counter, generatedAt: new Date().toISOString() };
    },
    ["interview-counter"],
    { tags: ["interview-counter"], revalidate: 3600 }
  )();
}

/**
 * 自增计数 + 按标签失效缓存
 * 必须调用 revalidateTag，否则 getCachedCounter 仍返回旧的缓存值
 */
export async function incrementCounter() {
  counter += 1;
  // Next 16 起 revalidateTag 需传入 cache-life profile（"default"/"seconds"）
  revalidateTag("interview-counter", "default");
  return counter;
}
