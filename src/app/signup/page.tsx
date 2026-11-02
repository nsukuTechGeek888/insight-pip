import { Suspense } from "react";
import AccountAccess from "@/components/research/AccountAccess";
export default function Page() {
  return (
    <Suspense fallback={<div className="v2-state">Loading…</div>}>
      <AccountAccess register />
    </Suspense>
  );
}
