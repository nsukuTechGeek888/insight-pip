import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function POST(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const u = await requestUser(r);
    if (!u)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const b = await r.json();
    if (
      typeof b.reason !== "string" ||
      b.reason.trim().length < 10 ||
      b.reason.length > 2000
    )
      return NextResponse.json(
        { error: "Explain your appeal in 10–2,000 characters" },
        { status: 400 },
      );
    const review = await prisma.review.findFirst({
      where: {
        id,
        userId: u.id,
        status: { in: ["REJECTED", "FLAGGED", "RETRACTED"] },
      },
    });
    if (!review)
      return NextResponse.json(
        { error: "Only a moderated review can be appealed" },
        { status: 400 },
      );
    const appeal = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM reviews WHERE id = ${id} FOR UPDATE`;
      if (
        await tx.reviewAppeal.findFirst({
          where: { reviewId: id, status: "PENDING" },
        })
      )
        return null;
      const appeal = await tx.reviewAppeal.create({
        data: { userId: u.id, reviewId: id, reason: b.reason.trim() },
      });
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: "APPEAL_SUBMITTED",
          entityType: "review",
          entityId: id,
        },
      });
      return appeal;
    });
    return NextResponse.json(
      appeal
        ? { success: true, appeal }
        : { error: "An appeal is already awaiting review" },
      { status: appeal ? 201 : 409 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to save appeal" },
      { status: 503 },
    );
  }
}
