import { describe, it, expect, beforeEach } from "vitest";
import {
  listItems,
  addItem,
  getItem,
  updateItem,
  removeItem,
  clearItems,
} from "@/lib/concepts-store";

// concepts/api 的内存 store 单元测试
describe("concepts-store", () => {
  beforeEach(() => {
    clearItems();
    // 重置为初始两条数据
    addItem("Alpha");
    addItem("Beta");
  });

  it("listItems 返回所有项", () => {
    expect(listItems()).toHaveLength(2);
  });

  it("listItems 支持按关键字过滤（大小写不敏感）", () => {
    expect(listItems("al")).toHaveLength(1);
    expect(listItems("al")[0].name).toBe("Alpha");
    expect(listItems("BETA")).toHaveLength(1);
  });

  it("addItem 递增分配 id 并加入列表", () => {
    const item = addItem("Gamma");
    expect(item.id).toBe(3);
    expect(listItems()).toHaveLength(3);
  });

  it("getItem 能按 id 找到项，找不到返回 undefined", () => {
    expect(getItem(1)?.name).toBe("Alpha");
    expect(getItem(999)).toBeUndefined();
  });

  it("updateItem 更新名字，找不到返回 undefined", () => {
    const updated = updateItem(1, "Alpha v2");
    expect(updated?.name).toBe("Alpha v2");
    expect(getItem(1)?.name).toBe("Alpha v2");
    expect(updateItem(999, "x")).toBeUndefined();
  });

  it("removeItem 删除并返回被删项，找不到返回 undefined", () => {
    const removed = removeItem(1);
    expect(removed?.name).toBe("Alpha");
    expect(listItems()).toHaveLength(1);
    expect(removeItem(999)).toBeUndefined();
  });

  it("clearItems 清空列表并重置 id", () => {
    clearItems();
    expect(listItems()).toHaveLength(0);
    const item = addItem("New");
    expect(item.id).toBe(1);
  });
});
