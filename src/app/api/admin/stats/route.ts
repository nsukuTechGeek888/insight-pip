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

    const [
      totalUsers,
      totalReviews,
      pendingReviews,
      totalIncidents,
      pendingIncidents,
      totalBrokers,
      totalPropFirms,
      recentReviews,
      recentIncidents,
      reviewStats,
      incidentStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.incident.count(),
      prisma.incident.count({ where: { status: "PENDING" } }),
      prisma.broker.count(),
      prisma.propFirm.count(),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.incident.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.review.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.incident.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const [
      activeBrokers,
      activePropFirms,
      reportedReviews,
      publishedReviews,
      publishedArticles,
      draftArticles,
      newUsers7Days,
    ] = await Promise.all([
      prisma.broker.count({ where: { status: "ACTIVE" } }),
      prisma.propFirm.count({ where: { status: "ACTIVE" } }),
      prisma.review.count({where:{reports:{some:{status:"PENDING"}}}}),
      prisma.review.count({ where: { status: "APPROVED", isHidden: false } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      }),
    ]);
      const [growth,openIncidents]=await Promise.all([
      prisma.$queryRaw<{day:Date;users:number;reviews:number;incidents:number}[]>`WITH days AS (SELECT generate_series(date_trunc('day', NOW()) - INTERVAL '29 days', date_trunc('day', NOW()), INTERVAL '1 day') AS day) SELECT day, (SELECT COUNT(*)::int FROM users WHERE "createdAt" >= day AND "createdAt" < day + INTERVAL '1 day') AS users, (SELECT COUNT(*)::int FROM reviews WHERE created_at >= day AND created_at < day + INTERVAL '1 day') AS reviews, (SELECT COUNT(*)::int FROM incidents WHERE created_at >= day AND created_at < day + INTERVAL '1 day') AS incidents FROM days ORDER BY day`,
      prisma.incident.count({where:{resolutionStatus:{not:'RESOLVED'},status:{notIn:['REJECTED','ARCHIVED']}}})
    ]);
    return NextResponse.json({
      success: true,
      growth,
      stats: {
        users: totalUsers,
        openIncidents,
        activeProviders: activeBrokers + activePropFirms,
        reportedReviews,
        publishedReviews,
        newUsers7Days,
        content: { published: publishedArticles, drafts: draftArticles },
        reviews: {
          total: totalReviews,
          pending: pendingReviews,
          breakdown: reviewStats,
        },
        incidents: {
          total: totalIncidents,
          pending: pendingIncidents,
          breakdown: incidentStats,
        },
        brokers: totalBrokers,
        propFirms: totalPropFirms,
      },
      recent: {
        reviews: recentReviews,
        incidents: recentIncidents,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
