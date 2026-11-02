import IncidentDetail from "@/components/research/IncidentDetail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <IncidentDetail id={(await params).id} />;
}
