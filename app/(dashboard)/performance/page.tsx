// ============================================================================
// 【Next.js 知识点】Server Component — 绩效考核数据加载
// ============================================================================
// 1. Promise.all 并行加载考核记录 + 员工列表
// 2. 考核记录已在 actions.ts 中通过 JOIN 带出员工姓名
// 3. 员工列表用于"新建考核"时选择被考核人
// ============================================================================

import { getReviews } from "./actions";
import { getEmployees } from "../employees/actions";
import { PerformanceList } from "./performance-list";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const [reviewData, employeeData] = await Promise.all([
    getReviews(),
    getEmployees(),
  ]);
  return (
    <PerformanceList initialData={reviewData} employees={employeeData} />
  );
}
