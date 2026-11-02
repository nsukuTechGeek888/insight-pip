import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { POST as upload } from "@/app/api/evidence/route";
export async function POST(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const u = await requestUser(r);
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await prisma.incident.findFirst({ where: { id, userId: u.id } })))
    return NextResponse.json(
      { error: "Incident unavailable" },
      { status: 404 },
    );
  const response = await upload(r);
  if (!response.ok) return response;
  const data = await response.json();
  await prisma.privateEvidence.update({
    where: { id: data.evidence.id },
    data: { incidentId: id },
  });
  return NextResponse.json({
    success: true,
    fileUrl: "/api/evidence/" + data.evidence.id,
    proofProvided: true,
    message: "Evidence stored privately for moderation",
  });
}
export async function GET(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const u = await requestUser(r);
    if (!u)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident || (incident.userId !== u.id && u.role !== "ADMIN"))
      return NextResponse.json(
        { error: "Evidence unavailable" },
        { status: 404 },
      );
    const index = Number(r.nextUrl.searchParams.get("index"));
    const url = incident.proofUrls[index];
    if (
      !Number.isInteger(index) ||
      !url ||
      !/^\/uploads\/incidents\/[a-zA-Z0-9_.-]+$/.test(url)
    )
      return NextResponse.json(
        { error: "Evidence unavailable" },
        { status: 404 },
      );
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const bytes = await readFile(path.join(process.cwd(), "public", url));
    await prisma.auditEvent.create({
      data: {
        actorId: u.id,
        action: "LEGACY_EVIDENCE_VIEWED",
        entityType: "incident",
        entityId: id,
      },
    });
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="previous-evidence"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Evidence unavailable" },
      { status: 404 },
    );
  }
}
