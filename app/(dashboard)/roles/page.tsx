import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRoles } from "./actions";
import { RoleList } from "./role-list";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    redirect("/");
  }
  const data = await getRoles();
  return <RoleList initialData={data} />;
}
