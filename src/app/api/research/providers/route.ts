import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;
    const type = q.get("type") === "prop-firms" ? "prop-firms" : "brokers";
    const page = Math.max(1, Math.min(10000, Math.floor(Number(q.get("page"))) || 1));
    const limit = Math.max(1, Math.min(50, Math.floor(Number(q.get("limit"))) || 12));
    const region = q.get("region") || "GLOBAL";
    const search = (q.get("search") || "").slice(0, 100);
    const order: Prisma.SortOrder = q.get("order") === "desc" ? "desc" : "asc";
    const where = {
      status: "ACTIVE",
      name: { contains: search, mode: "insensitive" as const },
      AND: [
        {
          OR: [
            { regions: { has: region } },
            { regions: { has: "GLOBAL" } },
            { regions: { isEmpty: true } },
          ],
        },
        { NOT: { restrictedRegions: { has: region } } },
      ],
    };
    const select = {
      id: true,
      name: true,
      slug: true,
      logo: true,
      shortDescription: true,
      headquarters: true,
      founded: true,
      updatedAt: true,
      _count: {
        select: { reviews: { where: { status: "APPROVED", isHidden: false } } },
      },
    };
    const args = {
      where,
      select,
      orderBy: { name: order },
      skip: (page - 1) * limit,
      take: limit,
    };
    const [rows, total] =
      type === "brokers"
        ? await prisma.$transaction([
            prisma.broker.findMany(args),
            prisma.broker.count({ where }),
          ])
        : await prisma.$transaction([
            prisma.propFirm.findMany(args),
            prisma.propFirm.count({ where }),
          ]);
    const aggregates = await Promise.all(
      rows.map((p) =>
        prisma.review.aggregate({
          where: {
            status: "APPROVED",
            isHidden: false,
            ...(type === "brokers" ? { brokerId: p.id } : { propFirmId: p.id }),
          },
          _avg: { rating: true },
        }),
      ),
    );
    return NextResponse.json({
      success: true,
      data: rows.map((p, i) => ({
        ...p,
        rating: aggregates[i]._avg.rating,
        reviewsCount: p._count.reviews,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Provider research is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
