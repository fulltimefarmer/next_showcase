// ============================================================================
// 【Next.js 知识点】Server Component — 跨模块数据加载
// ============================================================================
// 1. 资产页需要"员工列表"来填充"使用人"下拉框 —— 跨模块依赖
// 2. 直接 import 其它模块的 Server Action（../employees/actions）
//    - 都在服务端运行，可以自由复用，不会产生额外网络请求
// 3. 数据并行获取后通过 props 传给客户端组件 AssetList
// ============================================================================

import { getAssets } from "./actions";
import { getEmployees } from "../employees/actions";
import { AssetList } from "./asset-list";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await getAssets();
  const employees = await getEmployees();
  return <AssetList initialData={assets} initialEmps={employees} />;
}
