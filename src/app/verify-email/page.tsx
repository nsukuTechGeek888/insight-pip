import { Suspense } from "react";
import AccountRecovery from "@/components/research/AccountRecovery";
export default function Page() {
  return (
    <Suspense
      fallback={<div className="v2-state">Loading account security…</div>}
    >
      <AccountRecovery mode="verify" />
    </Suspense>
  );
}
