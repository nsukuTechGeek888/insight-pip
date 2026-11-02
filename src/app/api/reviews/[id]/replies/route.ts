import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { throttle } from "@/lib/platform-security";
export async function GET(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requestUser(r);
  const review = await prisma.review.findUnique({ where: { id } });
  if (
    !review ||
    ((review.status !== "APPROVED" || review.isHidden) &&
      u?.id !== review.userId &&
      u?.role !== "ADMIN")
  )
    return NextResponse.json({ error: "Review unavailable" }, { status: 404 });
  const visibility =
    u?.role === "ADMIN"
      ? {}
      : {
          OR: [
            { isApproved: true, isHidden: false },
            ...(u ? [{ userId: u.id }] : []),
          ],
        };
  const replies = await prisma.reviewReply.findMany({
    where: {
      reviewId: id,
      parentReplyId: r.nextUrl.searchParams.get("parentId") || null,
      ...visibility,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true, role: true } },
      broker: { select: { name: true } },
      propFirm: { select: { name: true } },
      replies: {
        where: visibility,
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ success: true, replies });
}
export async function POST(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const u = await requestUser(r);
    if (!u)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await throttle(r, "reply", 15, 60, u.id)))
      return NextResponse.json(
        { error: "Reply limit reached" },
        { status: 429 },
      );
    const { id } = await params;
    let content: unknown, parentReplyId: unknown;
    const type = r.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      const b = await r.json();
      content = b.content;
      parentReplyId = b.parentReplyId;
    } else {
      const form = await r.formData();
      content = form.get("content");
      parentReplyId = form.get("parentReplyId");
      if (form.getAll("media").some((f) => f instanceof File && f.size))
        return NextResponse.json(
          {
            error:
              "Public reply attachments are not accepted. Submit supporting evidence privately with your review.",
          },
          { status: 400 },
        );
    }
    if (
      typeof content !== "string" ||
      content.trim().length < 3 ||
      content.length > 2000
    )
      return NextResponse.json(
        { error: "Write a reply of 3–2,000 characters" },
        { status: 400 },
      );
    const review = await prisma.review.findFirst({
      where: { id, status: "APPROVED", isHidden: false },
    });
    if (!review)
      return NextResponse.json(
        { error: "Review unavailable" },
        { status: 404 },
      );
    if (parentReplyId) {
      if (
        typeof parentReplyId !== "string" ||
        !(await prisma.reviewReply.findFirst({
          where: {
            id: parentReplyId,
            reviewId: id,
            isApproved: true,
            isHidden: false,
          },
        }))
      )
        return NextResponse.json(
          { error: "Parent reply unavailable" },
          { status: 400 },
        );
    }
    const entityType = review.brokerId ? "brokers" : "prop-firms";
    const entityId = review.brokerId || review.propFirmId!;
    const representative = await prisma.providerRepresentative.findUnique({
      where: {
        userId_entityType_entityId: { userId: u.id, entityType, entityId },
      },
    });
    const reply = await prisma.$transaction(async (tx) => {
      const reply = await tx.reviewReply.create({
        data: {
          reviewId: id,
          userId: u.id,
          content: content.trim(),
          mediaUrls: [],
          parentReplyId:
            typeof parentReplyId === "string" ? parentReplyId : null,
          replyType:
            u.role === "ADMIN"
              ? "ADMIN"
              : representative
                ? review.brokerId
                  ? "BROKER"
                  : "PROP_FIRM"
                : "USER",
          brokerId: representative ? review.brokerId : null,
          propFirmId: representative ? review.propFirmId : null,
          isApproved: u.role === "ADMIN",
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: "REPLY_SUBMITTED",
          entityType: "reply",
          entityId: reply.id,
        },
      });
      return reply;
    });
    return NextResponse.json(
      {
        success: true,
        reply,
        message: reply.isApproved
          ? "Reply published"
          : "Reply submitted for moderation",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Reply could not be saved" },
      { status: 400 },
    );
  }
}
