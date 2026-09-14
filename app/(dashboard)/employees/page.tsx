// ============================================================================
// 【Next.js 知识点】Server Component — 外键关联的跨模块数据
// ============================================================================
// 1. 员工页需要部门列表来填充"所属部门"下拉框
// 2. 跨模块 import: 直接复用 ../departments/actions 的 getDepartments
// 3. 数据通过 props 下发给客户端组件 EmployeeList
// ============================================================================

import { getEmployees } from "./actions";
import { getDepartments } from "../departments/actions";
import { EmployeeList } from "./employee-list";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await getEmployees();
  const departments = await getDepartments();
  return <EmployeeList initialData={employees} initialDepts={departments} />;
}
