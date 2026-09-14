// ============================================================================
// 【Next.js 知识点】内存数据存储（仅用于 Route Handler 演示）
// ============================================================================
// 演示用内存 store，供 concepts/api 的 Route Handlers 共享。
// 真实项目应替换为数据库（Drizzle ORM / Prisma 等）。
// 注意：模块级状态在 Serverless 环境不保证持久，仅 dev 演示有效。
// ============================================================================

export type Item = { id: number; name: string };

let store: Item[] = [
  { id: 1, name: "Alpha" },
  { id: 2, name: "Beta" },
];
let nextId = 3;

export function listItems(keyword?: string): Item[] {
  if (!keyword) return [...store];
  return store.filter((i) => i.name.toLowerCase().includes(keyword.toLowerCase()));
}

export function addItem(name: string): Item {
  const item: Item = { id: nextId++, name };
  store.push(item);
  return item;
}

export function getItem(id: number): Item | undefined {
  return store.find((i) => i.id === id);
}

export function updateItem(id: number, name: string): Item | undefined {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  store[idx] = { ...store[idx], name };
  return store[idx];
}

export function removeItem(id: number): Item | undefined {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  return store.splice(idx, 1)[0];
}

export function clearItems(): void {
  store = [];
  nextId = 1;
}
