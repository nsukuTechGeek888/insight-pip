import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function GET(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const q = r.nextUrl.searchParams;
    const page = Math.max(1, Math.floor(Number(q.get("page")) || 1));
    const tab = q.get("tab") || "pending";
    const search = (q.get("search") || "").slice(0, 150);
    const where: Prisma.ReviewWhereInput = {
      ...(tab === "pending"
        ? { status: "PENDING" }
        : tab === "reported"
          ? { reports: { some: { status: "PENDING" } } }
          : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [reviews, total, appeals, reports, replies] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * 20,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          broker: { select: { name: true } },
          propFirm: { select: { name: true } },
          evidence: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              status: true,
            },
          },
          reports: {
            where: { status: "PENDING" },
            select: { id: true, reason: true, details: true },
          },
          appeals: { orderBy: { createdAt: "desc" }, take: 3 },
        },
      }),
      prisma.review.count({ where }),
      prisma.reviewAppeal.findMany({
        where: { status: "PENDING" },
        include: {
          review: { select: { title: true, content: true, rating: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.reviewReport.count({ where: { status: "PENDING" } }),
      prisma.reviewReply.findMany({
        where: { isApproved: false, isHidden: false },
        include: {
          user: { select: { name: true } },
          review: { select: { title: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
    ]);
    return NextResponse.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / 20),
      appeals,
      pendingReports: reports,
      replies,
    });
  } catch {
    return NextResponse.json(
      { error: "Moderation queue unavailable" },
      { status: 503 },
    );
  }
}
export async function POST(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await r.json();
    const note = typeof b.note === "string" ? b.note.trim().slice(0, 2000) : "";
    const actions = [
      "approve",
      "reject",
      "hide",
      "unhide",
      "feature",
      "unfeature",
      "verify-experience",
      "evidence-reviewed",
      "resolve-report",
      "accept-appeal",
      "reject-appeal",
      "approve-reply",
      "reject-reply",
    ];
    if (!actions.includes(b.action) || typeof b.id !== "string")
      return NextResponse.json(
        { error: "Invalid moderation action" },
        { status: 400 },
      );
    if (
      [
        "reject",
        "hide",
        "verify-experience",
        "resolve-report",
        "accept-appeal",
        "reject-appeal",
      ].includes(b.action) &&
      note.length < 5
    )
      return NextResponse.json(
        { error: "Record a moderation reason (at least 5 characters)" },
        { status: 400 },
      );
    await prisma.$transaction(async (tx) => {
      if (b.action === "approve-reply" || b.action === "reject-reply") {
        const reply = await tx.reviewReply.update({
          where: { id: b.id },
          data: {
            isApproved: b.action === "approve-reply",
            isHidden: b.action === "reject-reply",
            moderatedBy: u.id,
            moderatedAt: new Date(),
          },
        });
        if (reply.userId)
          await tx.notification.create({
            data: {
              userId: reply.userId,
              title: "Reply moderation update",
              body:
                b.action === "approve-reply"
                  ? "Your reply has been published."
                  : "Your reply was not published. " + note,
              href: "/reviews/" + reply.reviewId,
            },
          });
      } else if (b.action === "evidence-reviewed") {
        const evidence = await tx.privateEvidence.findUniqueOrThrow({
          where: { id: b.id },
        });
        await tx.privateEvidence.update({
          where: { id: evidence.id },
          data: { status: "REVIEWED" },
        });
      } else if (b.action === "resolve-report") {
        await tx.reviewReport.update({
          where: { id: b.id },
          data: {
            status: "RESOLVED",
            resolvedBy: u.id,
            resolvedAt: new Date(),
            resolution: note,
          },
        });
      } else if (b.action === "accept-appeal" || b.action === "reject-appeal") {
        const appeal = await tx.reviewAppeal.findUniqueOrThrow({
          where: { id: b.id },
        });
        if (appeal.status !== "PENDING") throw Error("Appeal already resolved");
        await tx.reviewAppeal.update({
          where: { id: b.id },
          data: {
            status: b.action === "accept-appeal" ? "ACCEPTED" : "REJECTED",
            resolution: note,
            resolvedBy: u.id,
            resolvedAt: new Date(),
          },
        });
        if (b.action === "accept-appeal")
          await tx.review.update({
            where: { id: appeal.reviewId },
            data: {
              status: "PENDING",
              isApproved: false,
              moderationNote: note,
            },
          });
        await tx.notification.create({
          data: {
            userId: appeal.userId,
            title: "Appeal reviewed",
            body: note,
            href: "/dashboard/reviews",
          },
        });
      } else {
        const review = await tx.review.findUniqueOrThrow({
          where: { id: b.id },
        });
        let data: Prisma.ReviewUpdateInput = {
          moderatedBy: u.id,
          moderatedAt: new Date(),
        };
        if (note) data.moderationNote = note;
        if (b.action === "approve")
          data = {
            ...data,
            status: "APPROVED",
            retractedAt:null,retractionReason:null,
            isApproved: true,
            isHidden: false,
          };
        if (b.action === "reject")
          data = { ...data, status: "REJECTED", isApproved: false };
        if (b.action === "hide") data.isHidden = true;
        if (b.action === "unhide") data.isHidden = false;
        if (b.action === "feature") data.isFeatured = true;
        if (b.action === "unfeature") data.isFeatured = false;
        if (b.action === "verify-experience") {
          if (
            !(await tx.privateEvidence.count({
              where: { reviewId: review.id, status: "REVIEWED" },
            }))
          )
            throw Error("Review supporting evidence first");
          data = { ...data, isVerified: true, verifiedTrader: true };
        }
        await tx.review.update({ where: { id: review.id }, data });
        await tx.notification.create({
          data: {
            userId: review.userId,
            title: "Review status updated",
            body: `Your review received a moderation decision: ${b.action}. ${note}`,
            href: "/dashboard/reviews",
          },
        });
      }
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: b.action.toUpperCase().replaceAll("-", "_"),
          entityType: b.action.includes("appeal")
            ? "appeal"
            : b.action === "resolve-report"
              ? "report"
              : b.action === "evidence-reviewed"
                ? "evidence"
                : "review",
          entityId: String(b.id),
          metadata: { note },
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error &&
          [
            "Review supporting evidence first",
            "Appeal already resolved",
          ].includes(e.message)
            ? e.message
            : "Moderation could not be saved",
      },
      { status: 400 },
    );
  }
}
