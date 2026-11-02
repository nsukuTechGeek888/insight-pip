import { Suspense } from "react";
import Community from "@/components/research/Community";
export default function IncidentsPage() {
  return (
    <Suspense fallback={<div className="v2-state">Loading…</div>}>
      {<Community incidents />}
    </Suspense>
  );
}
