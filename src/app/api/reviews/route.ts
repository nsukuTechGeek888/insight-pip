import {verifiedIds} from "@/lib/verification";
import { z } from "zod";
import { throttle } from "@/lib/platform-security";
import { evidenceIds, attachEvidence } from "@/lib/evidence";
import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// Helper function to verify custom JWT token
async function getUserFromToken(request: NextRequest) {
  return requestUser(request);
}

// Helper function to calculate trust score
function calculateTrustScore(data: any): number {
  let score = 0;
  let totalWeight = 0;

  // Withdrawal Experience (40%)
  if (data.withdrawalExperience && data.withdrawalExperience > 0) {
    score += (data.withdrawalExperience / 5) * 40;
    totalWeight += 40;
  } else if (data.withdrawalSpeed === "Still Waiting") {
    score += 0;
    totalWeight += 40;
  } else if (data.withdrawalSpeed) {
    const speedScores: Record<string, number> = {
      "Same Day": 5,
      "1-3 Days": 4,
      "3-7 Days": 3,
      "7+ Days": 2,
      "Still Waiting": 0,
    };
    score += (speedScores[data.withdrawalSpeed] / 5) * 40;
    totalWeight += 40;
  }

  // Execution Quality (20%)
  if (data.executionQuality && data.executionQuality > 0) {
    score += (data.executionQuality / 5) * 20;
    totalWeight += 20;
  }

  // Reliability (20%)
  if (data.reliability && data.reliability > 0) {
    score += (data.reliability / 5) * 20;
    totalWeight += 20;
  }

  // Customer Support (10%)
  if (data.customerSupport && data.customerSupport > 0) {
    score += (data.customerSupport / 5) * 10;
    totalWeight += 10;
  }

  // Recommendation (10%)
  if (data.wouldRecommend === "Yes") {
    score += 10;
    totalWeight += 10;
  } else if (data.wouldRecommend === "No") {
    score += 0;
    totalWeight += 10;
  }

  // Account Issues (penalty)
  if (
    data.accountIssues &&
    data.accountIssues !== "No Issues" &&
    data.accountIssues !== ""
  ) {
    score = score * 0.8;
  }

  // If no weighted fields, return default
  if (totalWeight === 0) {
    return 50;
  }

  return Math.min(100, Math.round((score / totalWeight) * 100));
}

// Helper function to update broker statistics
async function updateBrokerStats(brokerId: number) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        brokerId,
        status: "APPROVED",
      },
    });

    if (reviews.length === 0) return;

    const avgTrustScore =
      reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;

    const avgWithdrawalSuccess =
      reviews
        .filter((r) => r.withdrawalExperience)
        .reduce((sum, r) => sum + (r.withdrawalExperience || 0), 0) /
      (reviews.filter((r) => r.withdrawalExperience).length || 1);

    const avgExecutionQuality =
      reviews
        .filter((r) => r.executionQuality)
        .reduce((sum, r) => sum + (r.executionQuality || 0), 0) /
      (reviews.filter((r) => r.executionQuality).length || 1);

    const avgReliability =
      reviews
        .filter((r) => r.reliability)
        .reduce((sum, r) => sum + (r.reliability || 0), 0) /
      (reviews.filter((r) => r.reliability).length || 1);

    const recommendationRate =
      (reviews.filter((r) => r.wouldRecommend === "Yes").length /
        reviews.length) *
      100;

    const withdrawalStats = {
      sameDay: reviews.filter((r) => r.withdrawalSpeed === "Same Day").length,
      oneToThreeDays: reviews.filter((r) => r.withdrawalSpeed === "1-3 Days")
        .length,
      threeToSevenDays: reviews.filter((r) => r.withdrawalSpeed === "3-7 Days")
        .length,
      sevenPlusDays: reviews.filter((r) => r.withdrawalSpeed === "7+ Days")
        .length,
      stillWaiting: reviews.filter((r) => r.withdrawalSpeed === "Still Waiting")
        .length,
    };

    const accountIssueStats = {
      noIssues: reviews.filter((r) => r.accountIssues === "No Issues").length,
      temporarySuspension: reviews.filter(
        (r) => r.accountIssues === "Temporary Account Suspension",
      ).length,
      withdrawalDelayed: reviews.filter(
        (r) => r.accountIssues === "Withdrawal Delayed",
      ).length,
      withdrawalRejected: reviews.filter(
        (r) => r.accountIssues === "Withdrawal Rejected",
      ).length,
      accountTerminated: reviews.filter(
        (r) => r.accountIssues === "Account Terminated",
      ).length,
      ruleViolation: reviews.filter(
        (r) => r.accountIssues === "Rule Violation Dispute",
      ).length,
    };

    await prisma.broker.update({
      where: { id: brokerId },
      data: {
        avgTrustScore,
        avgWithdrawalSuccess,
        avgExecutionQuality,
        avgReliability,
        recommendationRate,
        withdrawalStats: JSON.stringify(withdrawalStats),
        accountIssueStats: JSON.stringify(accountIssueStats),
        avgWithdrawalExperience: avgWithdrawalSuccess,

        avgCustomerSupport:
          reviews
            .filter((r) => r.customerSupport)
            .reduce((sum, r) => sum + (r.customerSupport || 0), 0) /
          (reviews.filter((r) => r.customerSupport).length || 1),
      },
    });
  } catch (error) {
    console.error("Error updating broker stats:", error);
  }
}

// Helper function to update prop firm statistics
async function updatePropFirmStats(propFirmId: number) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        propFirmId,
        status: "APPROVED",
      },
    });

    if (reviews.length === 0) return;

    const avgTrustScore =
      reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;

    const avgWithdrawalSuccess =
      reviews
        .filter((r) => r.withdrawalExperience)
        .reduce((sum, r) => sum + (r.withdrawalExperience || 0), 0) /
      (reviews.filter((r) => r.withdrawalExperience).length || 1);

    const avgExecutionQuality =
      reviews
        .filter((r) => r.executionQuality)
        .reduce((sum, r) => sum + (r.executionQuality || 0), 0) /
      (reviews.filter((r) => r.executionQuality).length || 1);

    const avgReliability =
      reviews
        .filter((r) => r.reliability)
        .reduce((sum, r) => sum + (r.reliability || 0), 0) /
      (reviews.filter((r) => r.reliability).length || 1);

    const recommendationRate =
      (reviews.filter((r) => r.wouldRecommend === "Yes").length /
        reviews.length) *
      100;

    const withdrawalStats = {
      sameDay: reviews.filter((r) => r.withdrawalSpeed === "Same Day").length,
      oneToThreeDays: reviews.filter((r) => r.withdrawalSpeed === "1-3 Days")
        .length,
      threeToSevenDays: reviews.filter((r) => r.withdrawalSpeed === "3-7 Days")
        .length,
      sevenPlusDays: reviews.filter((r) => r.withdrawalSpeed === "7+ Days")
        .length,
      stillWaiting: reviews.filter((r) => r.withdrawalSpeed === "Still Waiting")
        .length,
    };

    const accountIssueStats = {
      noIssues: reviews.filter((r) => r.accountIssues === "No Issues").length,
      temporarySuspension: reviews.filter(
        (r) => r.accountIssues === "Temporary Account Suspension",
      ).length,
      withdrawalDelayed: reviews.filter(
        (r) => r.accountIssues === "Withdrawal Delayed",
      ).length,
      withdrawalRejected: reviews.filter(
        (r) => r.accountIssues === "Withdrawal Rejected",
      ).length,
      accountTerminated: reviews.filter(
        (r) => r.accountIssues === "Account Terminated",
      ).length,
      ruleViolation: reviews.filter(
        (r) => r.accountIssues === "Rule Violation Dispute",
      ).length,
    };

    await prisma.propFirm.update({
      where: { id: propFirmId },
      data: {
        avgTrustScore,
        avgPayoutProcess: avgWithdrawalSuccess,
        avgExecutionQuality,
        avgReliability,
        recommendationRate,
      },
    });
  } catch (error) {
    console.error("Error updating prop firm stats:", error);
  }
}

// GET /api/reviews - List reviews with filters
export async function GET(request: NextRequest) {
  try {
    console.log("📥 GET /api/reviews started");
    const { searchParams } = new URL(request.url);

    const brokerId = searchParams.get("brokerId");
    const propFirmId = searchParams.get("propFirmId");
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status") || "APPROVED";
    const search = searchParams.get("search") || "";

    console.log("📥 Params:", {
      brokerId,
      propFirmId,
      type,
      userId,
      page,
      limit,
      sort,
      status,
      search,
    });

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (brokerId) where.brokerId = parseInt(brokerId);
    if (propFirmId) where.propFirmId = parseInt(propFirmId);

    if (type === "broker" && !brokerId) {
      where.brokerId = { not: null };
    } else if (type === "propFirm" && !propFirmId) {
      where.propFirmId = { not: null };
    }

    if (userId) where.userId = userId;
    const viewer = await getUserFromToken(request);
    if (viewer?.role === "ADMIN") {
      if (status) where.status = status;
    } else {
      where.status = "APPROVED";
      where.isHidden = false;where.retractedAt=null;
    }
    const minRating = Number(searchParams.get("minRating"));
    if (minRating >= 1 && minRating <= 5) where.rating = { gte: minRating };
    if (searchParams.get("verified") === "true") {where.isVerified=true;where.id={in:[...await verifiedIds("review")]};}
    const firmName = searchParams.get("firmName");
    if (firmName) {
      if (type === "propFirm") where.propFirm = { name: firmName };
      else where.broker = { name: firmName };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { pros: { contains: search, mode: "insensitive" } },
        { cons: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { broker: { name: { contains: search, mode: "insensitive" } } },
        { propFirm: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    console.log("📥 Where clause:", where);

    let orderBy: any = {};
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "mostHelpful":
      case "most-helpful":
        orderBy = { helpfulCount: "desc" };
        break;
      case "trust-score":
        orderBy = { trustScore: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          _count: {
            select: {
              votes:{where:{voteType:"HELPFUL"}},
              replies:{where:{isApproved:true,isHidden:false}},
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    console.log(`📥 Found ${reviews.length} reviews (total: ${total})`);

    const verified=await verifiedIds("review",reviews.map(r=>r.id));
    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      experienceLevel: review.experienceLevel,
      yearsTrading: review.yearsTrading,
      tradingStyle: review.tradingStyle,
      tradingEnvironment: review.tradingEnvironment,
      platformStability: review.platformStability,
      executionQuality: review.executionQuality,
      withdrawalExperience: review.withdrawalExperience,
      depositExperience: review.depositExperience,
      customerSupport: review.customerSupport,
      reliability: review.reliability,
      value: review.value,
      withdrawalSpeed: review.withdrawalSpeed,
      accountIssues: review.accountIssues,
      wouldRecommend: review.wouldRecommend,
      trustScore: review.trustScore,
      pros: review.pros,
      cons: review.cons,
      isVerified: review.isVerified && verified.has(review.id),
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user,
      helpfulCount: review._count?.votes || 0,
      replyCount: review._count?.replies || 0,
      entityId: review.brokerId || review.propFirmId,
      entityName: review.broker?.name || review.propFirm?.name,
      entityType: review.brokerId ? "broker" : "propFirm",
      entityLogo: review.broker?.logo || review.propFirm?.logo,
      entitySlug: review.broker?.slug || review.propFirm?.slug,
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error in GET /api/reviews:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
      },
      { status: 500 },
    );
  }
}

// POST /api/reviews - Create a new review (FIXED VERSION)
const reviewSubmission = z
  .object({
    title: z.string().trim().min(2).max(150),
    content: z.string().trim().min(5).max(2000),
    rating: z.number().int().min(1).max(5),
    brokerId: z.number().int().positive().optional(),
    propFirmId: z.number().int().positive().optional(),
    platformStability: z.number().int().min(0).max(5).optional(),
    executionQuality: z.number().int().min(0).max(5).optional(),
    withdrawalExperience: z.number().int().min(0).max(5).optional(),
    depositExperience: z.number().int().min(0).max(5).optional(),
    customerSupport: z.number().int().min(0).max(5).optional(),
    reliability: z.number().int().min(0).max(5).optional(),
    value: z.number().int().min(0).max(5).optional(),
    pros: z.string().max(1000).optional(),
    cons: z.string().max(1000).optional(),
  })
  .refine((v) => !!v.brokerId !== !!v.propFirmId, {
    message: "Select exactly one provider",
  });
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user)
      return NextResponse.json(
        { error: "Sign in to submit a review" },
        { status: 401 },
      );
    if (!(await throttle(request, "review-submit", 5, 60, user.id)))
      return NextResponse.json(
        { error: "Submission limit reached. Try later." },
        { status: 429 },
      );
    const body = await request.json();
    const parsed = reviewSubmission.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const data = parsed.data;
    const ids = evidenceIds(body.evidenceIds);
    const provider = data.brokerId
      ? await prisma.broker.findUnique({
          where: { id: data.brokerId, status: "ACTIVE" },
        })
      : await prisma.propFirm.findUnique({
          where: { id: data.propFirmId, status: "ACTIVE" },
        });
    if (!provider)
      return NextResponse.json(
        { error: "Provider unavailable" },
        { status: 404 },
      );
    const review = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          ...data,
          platformStability: data.platformStability || null,
          executionQuality: data.executionQuality || null,
          withdrawalExperience: data.withdrawalExperience || null,
          depositExperience: data.depositExperience || null,
          customerSupport: data.customerSupport || null,
          reliability: data.reliability || null,
          value: data.value || null,
          userId: user.id,
          region: user.region,
          status: "PENDING",
          isApproved: false,
          isVerified: false,
          verifiedTrader: false,
        },
      });
      await attachEvidence(tx, user.id, ids, { reviewId: review.id });
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: "REVIEW_SUBMITTED",
          entityType: "review",
          entityId: review.id,
        },
      });
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Review received",
          body: "Your review is awaiting moderation.",
          href: "/dashboard/reviews",
        },
      });
      return review;
    });
    return NextResponse.json(
      {
        id: review.id,
        title: review.title,
        status: review.status,
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    )
      return NextResponse.json(
        {
          error:
            "You have already reviewed this provider. Edit your existing review.",
        },
        { status: 409 },
      );
    return NextResponse.json(
      {
        error:
          "Unable to submit your review. Check your evidence and try again.",
      },
      { status: 400 },
    );
  }
}
