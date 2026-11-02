import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function POST(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const u = await requestUser(r);
    if (!u)
      return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    const { id } = await params;
    const b = await r.json();
    if (
      typeof b.content !== "string" ||
      b.content.trim().length < 10 ||
      b.content.length > 2000
    )
      return NextResponse.json(
        { error: "Write an update of 10–2,000 characters" },
        { status: 400 },
      );
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident)
      return NextResponse.json(
        { error: "Incident unavailable" },
        { status: 404 },
      );
    const rep = await prisma.providerRepresentative.findUnique({
      where: {
        userId_entityType_entityId: {
          userId: u.id,
          entityType: incident.brokerId ? "brokers" : "prop-firms",
          entityId: incident.entityId,
        },
      },
    });
    if (u.role !== "ADMIN" && !rep && u.id !== incident.userId)
      return NextResponse.json(
        {
          error:
            "Only the reporting trader, authorised provider or admin can add updates",
        },
        { status: 403 },
      );
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM incidents WHERE id = ${id} FOR UPDATE`;
      const current = await tx.incident.findUniqueOrThrow({ where: { id } });
      const updates = Array.isArray(current.followUps) ? current.followUps : [];
      if (updates.length >= 50) throw Error();
      const update = {
        id: randomUUID(),
        content: b.content.trim(),
        authorId: u.id,
        authorType:
          u.role === "ADMIN"
            ? "MODERATOR"
            : rep
              ? "PROVIDER"
              : "REPORTING_TRADER",
        approved: u.role === "ADMIN",
        createdAt: new Date().toISOString(),
      };
      await tx.incident.update({
        where: { id },
        data: { followUps: [...updates, update] as Prisma.InputJsonValue },
      });
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: "INCIDENT_UPDATE_SUBMITTED",
          entityType: "incident",
          entityId: id,
        },
      });
    });
    return NextResponse.json({
      success: true,
      message:
        u.role === "ADMIN"
          ? "Update published"
          : "Update submitted for moderation",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to save update" },
      { status: 400 },
    );
  }
}
