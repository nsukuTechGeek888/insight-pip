import { Suspense } from "react";
import Community from "@/components/research/Community";
import { redirect } from "next/navigation";
export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const q = await searchParams;
  if (q.tab === "incidents") redirect("/incidents");
  return (
    <Suspense fallback={<div className="v2-state">Loading…</div>}>
      {<Community />}
    </Suspense>
  );
}
