import ProviderProfile from "@/components/research/ProviderProfile";
export default async function Page({
  params,
}: {
  params: Promise<{ broker: string }>;
}) {
  const p = await params;
  return <ProviderProfile type="brokers" slug={p.broker} />;
}
