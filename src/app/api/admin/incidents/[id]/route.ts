import { NextRequest, NextResponse } from "next/server";
import { IncidentType, ResolutionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function PATCH(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const b = await r.json();
    const note = typeof b.note === "string" ? b.note.trim().slice(0, 2000) : "";
    if (note.length < 5)
      return NextResponse.json(
        { error: "Record a moderation note of at least five characters" },
        { status: 400 },
      );
    const incident = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM incidents WHERE id = ${id} FOR UPDATE`;
      const current = await tx.incident.findUniqueOrThrow({ where: { id } });
      const data: Prisma.IncidentUpdateInput = {
        moderatedBy: u.id,
        moderatedAt: new Date(),
        moderationNote: note,
      };
      if (b.action === "approve") {
        data.status = "APPROVED";
        data.visibility = "PUBLIC";
      } else if (b.action === "reject") data.status = "REJECTED";
      else if (b.action === "flag") data.status = "FLAGGED";
      else if (b.action === "resolve") data.resolutionStatus = "RESOLVED";
      else if (b.action === "verify") {
        if (
          !(await tx.privateEvidence.count({
            where: { incidentId: id, status: "REVIEWED" },
          }))
        )
          throw Error("Review supporting evidence before confirming facts");
        data.verifiedBadge = true;
        data.proofVerified = true;
      } else if (b.action === "classify") {
        if (!Object.values(IncidentType).includes(b.incidentType))
          throw Error("Choose a valid incident category");
        data.incidentType = b.incidentType;
      } else if (b.action === "resolution") {
        if (!Object.values(ResolutionStatus).includes(b.resolutionStatus))
          throw Error("Choose a valid resolution status");
        data.resolutionStatus = b.resolutionStatus;
      } else if (b.action === "approve-update") {
        const updates = Array.isArray(current.followUps)
          ? current.followUps
          : [];
        data.followUps = updates.map((entry) =>
          entry &&
          typeof entry === "object" &&
          !Array.isArray(entry) &&
          entry.id === b.updateId
            ? { ...entry, approved: true }
            : entry,
        ) as Prisma.InputJsonValue;
      } else throw Error("Invalid action");
      const incident = await tx.incident.update({ where: { id }, data });
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: "INCIDENT_" + String(b.action).toUpperCase(),
          entityType: "incident",
          entityId: id,
          metadata: { note },
        },
      });
      await tx.notification.create({
        data: {
          userId: current.userId,
          title: "Incident status updated",
          body: note,
          href: "/incidents/" + id,
        },
      });
      return incident;
    });
    return NextResponse.json({ success: true, incident });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error && e.message.startsWith("Review supporting")
            ? e.message
            : "Unable to save incident decision",
      },
      { status: 400 },
    );
  }
}
export async function DELETE(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const u = await requestUser(r);
  if (u?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.$transaction(async (tx) => {
    await tx.incident.update({
      where: { id },
      data: { status: "ARCHIVED", visibility: "PRIVATE" },
    });
    await tx.auditEvent.create({
      data: {
        actorId: u.id,
        action: "INCIDENT_ARCHIVED",
        entityType: "incident",
        entityId: id,
      },
    });
  });
  return NextResponse.json({ success: true });
}
