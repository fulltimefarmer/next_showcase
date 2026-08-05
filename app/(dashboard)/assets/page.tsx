import { getAssets } from "./actions";
import { getEmployees } from "../employees/actions";
import { AssetList } from "./asset-list";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await getAssets();
  const employees = await getEmployees();
  return <AssetList initialData={assets} initialEmps={employees} />;
}
