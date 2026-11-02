import {verifiedIds} from "@/lib/verification";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegionFromRequest, isAvailableInRegion } from "@/lib/region";
export async function GET(r: NextRequest) {
  try {
    const q = r.nextUrl.searchParams;
    const type = q.get("type");
    if (!["brokers", "prop-firms"].includes(type || ""))
      return NextResponse.json(
        { error: "Invalid provider type" },
        { status: 400 },
      );
    const slug = (q.get("slug") || "").slice(0, 150);
    const identifier = /^\d+$/.test(slug) ? { id: Number(slug) } : { slug };
    const broker = type === "brokers";
    const provider = broker
      ? await prisma.broker.findFirst({
          where: { ...identifier, status: "ACTIVE" },
          include: { accountTypes: true, bonuses: true, promotions: true },
        })
      : await prisma.propFirm.findFirst({
          where: { ...identifier, status: "ACTIVE" },
          include: { programs: true, promotions: true },
        });
    if (!provider)
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    if (!isAvailableInRegion(provider, getRegionFromRequest(r)))
      return NextResponse.json(
        {
          error:
            "This provider is not listed as available in your selected region.",
          restricted: true,
        },
        { status: 403 },
      );
    const where = {
      ...(broker ? { brokerId: provider.id } : { propFirmId: provider.id }),
      status: "APPROVED",
      isHidden: false,
      retractedAt: null,
    };
    const [reviews, distribution, rating, categories, incidents, sources] =
      await Promise.all([
        prisma.review.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            content: true,
            rating: true,
            isVerified: true,
            createdAt: true,
            user: { select: { name: true } },
            _count: { select: { evidence: true } },
            replies: {
              where: {
                isApproved: true,
                isHidden: false,
                replyType: { in: ["BROKER", "PROP_FIRM", "ADMIN"] },
              },
              select: {
                id: true,
                content: true,
                replyType: true,
                createdAt: true,
              },
              take: 3,
            },
          },
        }),
        prisma.review.groupBy({ by: ["rating"], where, _count: true }),
        prisma.review.aggregate({
          where,
          _avg: { rating: true },
          _count: true,
        }),
        prisma.review.aggregate({
          where,
          _avg: {
            platformStability: true,
            executionQuality: true,
            withdrawalExperience: true,
            customerSupport: true,
            reliability: true,
          },
        }),
        prisma.incident.findMany({
          where: {
            ...(broker
              ? { brokerId: provider.id }
              : { propFirmId: provider.id }),
            status: "APPROVED",
            visibility: "PUBLIC",
          },
          select: {
            id: true,
            title: true,
            incidentType: true,
            resolutionStatus: true,
            reportDate: true,
            verifiedBadge: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.providerSource.findMany({
          where: { entityType: type!, entityId: provider.id },
          orderBy: { verifiedAt: "desc" },
        }),
      ]);
    const [verifiedReviews,confirmedIncidents]=await Promise.all([verifiedIds("review",reviews.map(r=>r.id)),verifiedIds("incident",incidents.map(i=>i.id))]);
    return NextResponse.json({
      provider,
      reviews:reviews.map(r=>({...r,isVerified:r.isVerified&&verifiedReviews.has(r.id)})),
      distribution,
      rating: rating._avg.rating,
      reviewCount: rating._count,
      categories: categories._avg,
      incidents:incidents.map(i=>({...i,verifiedBadge:i.verifiedBadge&&confirmedIncidents.has(i.id)})),
      sources,
    });
  } catch {
    return NextResponse.json(
      { error: "Provider research is temporarily unavailable" },
      { status: 503 },
    );
  }
}
