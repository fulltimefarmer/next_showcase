// ============================================================================
// 【Next.js 知识点】Server Component — Promise.all 并行数据获取
// ============================================================================
// 1. 请假页需要三份数据: 请假记录、请假类型、员工列表
// 2. Promise.all 并行请求，避免串行 await 造成的顺序等待（性能优化）
//    - 串行: await A → await B → await C（总耗时 = A+B+C）
//    - 并行: Promise.all([A, B, C])（总耗时 ≈ max(A, B, C)）
// 3. 与 Java 后端的 CompletableFuture.allOf 或线程池并行同理
// ============================================================================

import { getLeaveRequests, getLeaveTypes } from "./actions";
import { getEmployees } from "../employees/actions";
import { LeaveList } from "./leave-list";

export const dynamic = "force-dynamic";

export default async function LeavesPage() {
  const [leaveData, leaveTypesData, employeesData] = await Promise.all([
    getLeaveRequests(),
    getLeaveTypes(),
    getEmployees(),
  ]);
  return (
    <LeaveList
      initialData={leaveData}
      leaveTypes={leaveTypesData}
      employees={employeesData}
    />
  );
}
