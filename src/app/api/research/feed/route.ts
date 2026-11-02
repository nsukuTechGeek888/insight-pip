import {verifiedIds} from "@/lib/verification";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegionFromRequest, isAvailableInRegion } from "@/lib/region";
export async function GET(r: NextRequest) {
  try {
    const region = getRegionFromRequest(r);
    const [articles, reviews, incidents] = await Promise.all([
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          category: true,
          publishedAt: true,
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: 3,
      }),
      prisma.review.findMany({
        where: {
          status: "APPROVED",
          isHidden: false,
          retractedAt: null,
          OR: [
            { broker: { status: "ACTIVE" } },
            { propFirm: { status: "ACTIVE" } },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          rating: true,
          isVerified: true,
          createdAt: true,
          user: { select: { name: true } },
          broker: {
            select: { name: true, regions: true, restrictedRegions: true },
          },
          propFirm: {
            select: { name: true, regions: true, restrictedRegions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.incident.findMany({
        where: { status: "APPROVED", visibility: "PUBLIC" },
        select: {
          id: true,
          title: true,
          resolutionStatus: true,
          verifiedBadge: true,
          reportDate: true,
          broker: {
            select: { name: true, regions: true, restrictedRegions: true },
          },
          propFirm: {
            select: { name: true, regions: true, restrictedRegions: true },
          },
        },
        orderBy: { reportDate: "desc" },
        take: 15,
      }),
    ]);
    const verified=await verifiedIds("review",reviews.map(r=>r.id));
    return NextResponse.json({
      articles,
      reviews: reviews.map(r=>({...r,isVerified:r.isVerified&&verified.has(r.id)}))
        .filter((r) =>
          isAvailableInRegion(r.broker || r.propFirm || {}, region),
        )
        .slice(0, 3),
      incidents: incidents
        .filter((r) =>
          isAvailableInRegion(r.broker || r.propFirm || {}, region),
        )
        .slice(0, 3),
    });
  } catch {
    return NextResponse.json(
      { error: "Latest research is temporarily unavailable" },
      { status: 503 },
    );
  }
}
