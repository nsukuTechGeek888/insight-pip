import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getAdminUser(request: NextRequest) {
  const user = await requestUser(request);
  return user?.role === "ADMIN" ? user : null;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, reason, details } = body;

    if (!reviewId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Create report
    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        userId: admin.id,
        reason,
        details: details || null,
        status: "PENDING",
      },
    });

    // Update review report count
    await prisma.review.update({
      where: { id: reviewId },
      data: { reportCount: { increment: 1 } },
    });

    // Log the action (you could add audit logging here)

    return NextResponse.json({
      success: true,
      report,
      message: "Review flagged successfully",
    });
  } catch (error) {
    console.error("Error flagging review:", error);
    return NextResponse.json(
      { error: "Failed to flag review" },
      { status: 500 },
    );
  }
}
