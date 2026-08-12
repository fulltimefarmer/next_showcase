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
