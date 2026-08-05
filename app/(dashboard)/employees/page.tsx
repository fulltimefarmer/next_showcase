import { getEmployees } from "./actions";
import { getDepartments } from "../departments/actions";
import { EmployeeList } from "./employee-list";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await getEmployees();
  const departments = await getDepartments();
  return <EmployeeList initialData={employees} initialDepts={departments} />;
}
