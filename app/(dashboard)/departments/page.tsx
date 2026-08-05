import { getDepartments } from "./actions";
import { DepartmentList } from "./department-list";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const data = await getDepartments();
  return <DepartmentList initialData={data} />;
}
