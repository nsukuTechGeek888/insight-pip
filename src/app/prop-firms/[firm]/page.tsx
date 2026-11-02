import ProviderProfile from "@/components/research/ProviderProfile";
export default async function Page({
  params,
}: {
  params: Promise<{ firm: string }>;
}) {
  const p = await params;
  return <ProviderProfile type="prop-firms" slug={p.firm} />;
}
