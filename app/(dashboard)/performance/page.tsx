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
