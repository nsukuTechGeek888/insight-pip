import { NextRequest } from "next/server";
import { reactToIncident } from "@/lib/incident-reaction";
export async function POST(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return reactToIncident(r, (await params).id, "CONFIRM");
}
