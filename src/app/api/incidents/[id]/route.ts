import {verifiedIds} from "@/lib/verification";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function GET(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const u = await requestUser(r);
    const record = await prisma.incident.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        broker: { select: { id: true, name: true, slug: true } },
        propFirm: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!record)
      return NextResponse.json(
        { error: "Incident unavailable" },
        { status: 404 },
      );
    const privileged = u?.id === record.userId || u?.role === "ADMIN";
    if (
      !privileged &&
      (record.status !== "APPROVED" || record.visibility !== "PUBLIC")
    )
      return NextResponse.json(
        { error: "Incident unavailable" },
        { status: 404 },
      );
    const evidence = privileged
      ? await prisma.privateEvidence.findMany({
          where: { incidentId: id },
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            status: true,
          },
        })
      : [];
    const confirmed=await verifiedIds("incident",[id]);
    const incident = {
      id: record.id,
      title: record.title,
      description: record.description,
      incidentType: record.incidentType,
      incidentDate: record.incidentDate,
      reportDate: record.reportDate,
      resolutionStatus: record.resolutionStatus,
      status: record.status,
      confirmations: record.confirmations,
      disputes: record.disputes,
      verifiedBadge: record.verifiedBadge&&confirmed.has(id),
      proofProvided: evidence.length > 0 || record.proofUrls.length > 0,
      moderationNote: privileged ? record.moderationNote : null,
      user: { name: record.user.name },
      entity: record.broker || record.propFirm,
      entityType: record.entityType,
      evidence,
      legacyEvidence: privileged
        ? record.proofUrls.map((_, i) => ({
            label: `Previously submitted evidence ${i + 1}`,
            url: `/api/incidents/${id}/proof?index=${i}`,
          }))
        : [],
      updates: (Array.isArray(record.followUps) ? record.followUps : [])
        .filter(
          (x) =>
            x &&
            typeof x === "object" &&
            !Array.isArray(x) &&
            (x.approved === true || privileged || x.authorId === u?.id),
        )
        .map((x) => {
          const v = x as Record<string, unknown>;
          return {
            id: v.id,
            content: v.content,
            authorType: v.authorType,
            approved: v.approved,
            createdAt: v.createdAt,
          };
        }),
      canManage: u?.id === record.userId,
    };
    return NextResponse.json(
      { success: true, incident },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Incident unavailable" },
      { status: 503 },
    );
  }
}
