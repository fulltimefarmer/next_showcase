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
