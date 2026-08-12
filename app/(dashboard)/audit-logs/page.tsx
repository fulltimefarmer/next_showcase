import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAuditLogs } from "./actions";
import { AuditLogList } from "./audit-log-list";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    redirect("/");
  }
  const data = await getAuditLogs();
  return <AuditLogList initialData={data} />;
}
