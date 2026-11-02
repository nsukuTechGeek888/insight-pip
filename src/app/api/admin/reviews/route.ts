import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getAdminFromToken(request: NextRequest) {
  const user = await requestUser(request);
  return user?.role === "ADMIN" ? user : null;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== "all") where.status = status;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          broker: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          propFirm: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              votes: true,
              replies: true,
              reports: true,
            },
          },
          votes: {
            select: {
              id: true,
              voteType: true,
              userId: true,
            },
          },
          replies: {
            include: {
              user: { select: { name: true, email: true } },
              broker: { select: { name: true } },
              propFirm: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          reports: {
            where: { status: "PENDING" },
            select: {
              id: true,
              reason: true,
              details: true,
              status: true,
              createdAt: true,
              user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Format the reviews with proper counts
    const formattedReviews = reviews.map((review) => ({
      ...review,
      helpfulCount: review._count.votes,
      replyCount: review._count.replies,
      reportCount: review._count.reports,
      // Keep the _count for backward compatibility
      _count: review._count,
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, action, note } = await request.json();

    if (!reviewId || !action) {
      return NextResponse.json(
        {
          error: "Missing required fields: reviewId and action are required",
        },
        { status: 400 },
      );
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    let updateData: any = {};
    let actionDescription = "";

    switch (action) {
      case "approve":
        updateData = {
          status: "APPROVED",
          isApproved: true,
          moderatedBy: admin.id,
          moderatedAt: new Date(),
          moderationNote: note || null,
        };
        actionDescription = "approved";
        break;
      case "reject":
        updateData = {
          status: "REJECTED",
          isApproved: false,
          moderatedBy: admin.id,
          moderatedAt: new Date(),
          moderationNote: note || null,
        };
        actionDescription = "rejected";
        break;
      case "feature":
        updateData = { isFeatured: true };
        actionDescription = "featured";
        break;
      case "unfeature":
        updateData = { isFeatured: false };
        actionDescription = "unfeatured";
        break;
      case "hide":
        updateData = { isHidden: true };
        actionDescription = "hidden";
        break;
      case "unhide":
        updateData = { isHidden: false };
        actionDescription = "unhidden";
        break;
      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Allowed actions: approve, reject, feature, unfeature, hide, unhide",
          },
          { status: 400 },
        );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        broker: { select: { id: true, name: true } },
        propFirm: { select: { id: true, name: true } },
        _count: {
          select: {
            votes: true,
            replies: true,
            reports: true,
          },
        },
      },
    });

    // Format the response with proper counts
    const formattedReview = {
      ...review,
      helpfulCount: review._count.votes,
      replyCount: review._count.replies,
      reportCount: review._count.reports,
    };

    return NextResponse.json({
      success: true,
      review: formattedReview,
      message: `Review ${actionDescription} successfully`,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      {
        error: "Failed to update review",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 },
      );
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Delete the review (cascade will handle related records)
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      {
        error: "Failed to delete review",
      },
      { status: 500 },
    );
  }
}
