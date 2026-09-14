// ============================================================================
// 【Next.js 知识点】Server Component — 并行加载薪资 + 员工
// ============================================================================
// 1. 与 leaves 相同的 Promise.all 并行加载模式
// 2. 薪资列表需要员工姓名（JOIN 已在 actions 中完成），
//    同时还需要员工列表填充"添加薪资"表单的下拉框
// ============================================================================

import { getSalaries } from "./actions";
import { getEmployees } from "../employees/actions";
import { SalaryList } from "./salary-list";

export const dynamic = "force-dynamic";

export default async function SalariesPage() {
  const [salaryData, employeeData] = await Promise.all([
    getSalaries(),
    getEmployees(),
  ]);
  return <SalaryList initialData={salaryData} employees={employeeData} />;
}
