import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function reactToIncident(
  r: NextRequest,
  id: string,
  kind: "CONFIRM" | "DISPUTE",
) {
  try {
    const u = await requestUser(r);
    if (!u)
      return NextResponse.json(
        { error: "Sign in to respond" },
        { status: 401 },
      );
    const incident = await prisma.incident.findFirst({
      where: { id, status: "APPROVED", visibility: "PUBLIC" },
    });
    if (!incident)
      return NextResponse.json(
        { error: "Incident unavailable" },
        { status: 404 },
      );
    if (incident.userId === u.id)
      return NextResponse.json(
        { error: "You cannot respond to your own report" },
        { status: 400 },
      );
    const totals = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM incidents WHERE id = ${id} FOR UPDATE`;
      await tx.incidentReaction.upsert({
        where: { userId_incidentId: { userId: u.id, incidentId: id } },
        create: { userId: u.id, incidentId: id, kind },
        update: { kind },
      });
      const [confirmations, disputes] = await Promise.all([
        tx.incidentReaction.count({
          where: { incidentId: id, kind: "CONFIRM" },
        }),
        tx.incidentReaction.count({
          where: { incidentId: id, kind: "DISPUTE" },
        }),
      ]);
      await tx.incident.update({
        where: { id },
        data: { confirmations, disputes },
      });
      return { confirmations, disputes };
    });
    return NextResponse.json({
      success: true,
      ...totals,
      message: "Community responses are not independent fact verification.",
    });
  } catch {
    return NextResponse.json(
      { error: "Response could not be saved" },
      { status: 503 },
    );
  }
}
