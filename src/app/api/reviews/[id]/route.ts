import {verifiedIds} from "@/lib/verification";
import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getUserFromToken(request: NextRequest) {
  return requestUser(request);
}

// Helper functions
async function updateBrokerAverageRating(brokerId: number) {
  const reviews = await prisma.review.aggregate({
    where: {
      brokerId,
      status: "APPROVED",
    },
    _avg: {
      rating: true,
      serviceRating: true,
      platformRating: true,
      valueRating: true,
      supportRating: true,
    },
    _count: true,
  });

  await prisma.broker.update({
    where: { id: brokerId },
    data: {
      rating: reviews._avg.rating || 0,
      avgServiceRating: reviews._avg.serviceRating || 0,
      avgPlatformRating: reviews._avg.platformRating || 0,
      avgValueRating: reviews._avg.valueRating || 0,
      avgSupportRating: reviews._avg.supportRating || 0,
      reviewsCount: reviews._count,
    },
  });
}

async function updatePropFirmAverageRating(propFirmId: number) {
  const reviews = await prisma.review.aggregate({
    where: {
      propFirmId,
      status: "APPROVED",
    },
    _avg: {
      rating: true,
      tradingConditions: true,
      customerCare: true,
      userFriendliness: true,
      payoutProcess: true,
    },
    _count: true,
  });

  await prisma.propFirm.update({
    where: { id: propFirmId },
    data: {
      rating: reviews._avg.rating || 0,
      avgTradingConditions: reviews._avg.tradingConditions || 0,
      avgCustomerCare: reviews._avg.customerCare || 0,
      avgUserFriendliness: reviews._avg.userFriendliness || 0,
      avgPayoutProcess: reviews._avg.payoutProcess || 0,
      reviewsCount: reviews._count,
    },
  });
}

// GET /api/reviews/[id] - Get single review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        propFirm: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        replies: {
          where: { parentReplyId: null, isApproved: true, isHidden: false },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            broker: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            propFirm: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            replies: {
              where: { isApproved: true, isHidden: false },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                broker: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
                propFirm: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            votes:{where:{voteType:"HELPFUL"}},
            replies:{where:{isApproved:true,isHidden:false}},
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if current user has voted on this review
    const user = await getUserFromToken(request);
    if (
      (review.status !== "APPROVED" || review.isHidden) &&
      user?.id !== review.userId &&
      user?.role !== "ADMIN"
    )
      return NextResponse.json(
        { error: "Review unavailable" },
        { status: 404 },
      );
    let userVote = null;

    if (user) {
      const vote = await prisma.helpfulVote.findUnique({
        where: {
          reviewId_userId: {
            reviewId: id,
            userId: user.id,
          },
        },
      });
      if (vote) {
        userVote = vote.voteType;
      }
    }

    const verified=await verifiedIds("review",[review.id]);
    // Transform response
    const transformedReview = {
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      evidenceSubmitted:await prisma.privateEvidence.count({where:{reviewId:review.id}})>0,
      platformStability:review.platformStability,executionQuality:review.executionQuality,withdrawalExperience:review.withdrawalExperience,customerSupport:review.customerSupport,reliability:review.reliability,
      pros: review.pros,
      cons: review.cons,
      serviceRating: review.serviceRating,
      platformRating: review.platformRating,
      valueRating: review.valueRating,
      supportRating: review.supportRating,
      tradingConditions: review.tradingConditions,
      customerCare: review.customerCare,
      userFriendliness: review.userFriendliness,
      payoutProcess: review.payoutProcess,
      tradingExperience: review.tradingExperienceLevel,
      yearsTrading: review.yearsTrading,
      isVerified: review.isVerified && verified.has(review.id),
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user,
      helpfulCount: review._count?.votes || 0,
      replyCount: review._count?.replies || 0,
      userVote,
      entityId: review.brokerId || review.propFirmId,
      entityName: review.broker?.name || review.propFirm?.name,
      entityType: review.brokerId ? "broker" : "propFirm",
      entityLogo: review.broker?.logo || review.propFirm?.logo,
      entitySlug: review.broker?.slug || review.propFirm?.slug,
      replies: review.replies || [],
    };

    return NextResponse.json(transformedReview);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 },
    );
  }
}

// PUT /api/reviews/[id] - Update review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 },
      );
    }

    // Check if review exists and user owns it or is admin
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to edit this review" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      rating,
      pros,
      cons,
      serviceRating,
      platformRating,
      valueRating,
      supportRating,
      tradingConditions,
      customerCare,
      userFriendliness,
      payoutProcess,
      tradingExperience,
      yearsTrading,
    } = body;

    if (
      typeof title !== "string" ||
      title.trim().length < 2 ||
      title.length > 150 ||
      typeof content !== "string" ||
      content.trim().length < 5 ||
      content.length > 2000 ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    )
      return NextResponse.json(
        { error: "Enter a valid title, review and rating" },
        { status: 400 },
      );
    // Update review
    const review = await prisma.review.update({
      where: { id },
      data: {
        title,
        content,
        rating,
        pros,
        cons,
        serviceRating,
        platformRating,
        valueRating,
        supportRating,
        tradingConditions,
        customerCare,
        userFriendliness,
        payoutProcess,
        tradingExperienceLevel: tradingExperience,
        yearsTrading: yearsTrading ? String(yearsTrading) : null,
        status: "PENDING",
        isApproved: false,
        retractedAt:null,retractionReason:null,
        isVerified: false,
        verifiedTrader: false,
        moderatedAt: null,
        editedAt: new Date(), // Edits return to moderation
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update average ratings if review was previously approved
    if (existingReview.status === "APPROVED") {
      if (existingReview.brokerId) {
        await updateBrokerAverageRating(existingReview.brokerId);
      } else if (existingReview.propFirmId) {
        await updatePropFirmAverageRating(existingReview.propFirmId);
      }
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 },
    );
  }
}

// DELETE /api/reviews/[id] - Soft delete (retract) review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 },
      );
    }

    // Check if review exists and user owns it or is admin
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to delete this review" },
        { status: 403 },
      );
    }

    // Soft delete - set status to RETRACTED instead of actually deleting
    const review = await prisma.review.update({
      where: { id },
      data: {
        status: "RETRACTED",
        isApproved:false,isHidden:true,
        retractedAt: new Date(),
        retractionReason: "user_requested",
      },
    });

    await prisma.auditEvent.create({data:{actorId:user.id,action:"REVIEW_RETRACTED",entityType:"review",entityId:id}});
    // Update average ratings if review was approved
    if (existingReview.status === "APPROVED") {
      if (existingReview.brokerId) {
        await updateBrokerAverageRating(existingReview.brokerId);
      } else if (existingReview.propFirmId) {
        await updatePropFirmAverageRating(existingReview.propFirmId);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Review retracted successfully",
      review,
    });
  } catch (error) {
    console.error("Error retracting review:", error);
    return NextResponse.json(
      { error: "Failed to retract review" },
      { status: 500 },
    );
  }
}
