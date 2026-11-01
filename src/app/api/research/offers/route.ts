import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegionFromRequest, isAvailableInRegion } from "@/lib/region";
export async function GET(request: NextRequest) {
  try {
    const region = getRegionFromRequest(request);
    const [brokers, firms] = await Promise.all([
      prisma.broker.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          slug: true,
          regions: true,
          restrictedRegions: true,
          promotions: true,
          bonuses: true,
        },
      }),
      prisma.propFirm.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          slug: true,
          regions: true,
          restrictedRegions: true,
          promotions: true,
        },
      }),
    ]);
    const now = Date.now();
    const promotions = [
      ...brokers
        .filter((p) => isAvailableInRegion(p, region))
        .flatMap((p) =>
          p.promotions
            .filter(
              (o) =>
                isAvailableInRegion(o, region) &&
                (!o.validUntil || o.validUntil.getTime() >= now),
            )
            .map((o) => ({
              id: `broker-${o.id}`,
              provider: p.name,
              slug: p.slug,
              type: "brokers",
              title: o.name,
              description: o.description,
              discount: o.discount,
              code: o.code,
              expires: o.validUntil,
            })),
        ),
      ...firms
        .filter((p) => isAvailableInRegion(p, region))
        .flatMap((p) =>
          p.promotions
            .filter(
              (o) =>
                isAvailableInRegion(o, region) &&
                (!o.validUntil || o.validUntil.getTime() >= now),
            )
            .map((o) => ({
              id: `firm-${o.id}`,
              provider: p.name,
              slug: p.slug,
              type: "prop-firms",
              title: o.name,
              description: o.description,
              discount: o.discount,
              code: o.code,
              expires: o.validUntil,
            })),
        ),
    ];
    const bonuses = brokers
      .filter((p) => isAvailableInRegion(p, region))
      .flatMap((p) =>
        p.bonuses
          .filter(
            (o) =>
              isAvailableInRegion(o, region) &&
              (!o.expiry ||
                !Number.isFinite(Date.parse(o.expiry)) ||
                Date.parse(o.expiry) >= now),
          )
          .map((o) => ({
            id: `bonus-${o.id}`,
            provider: p.name,
            slug: p.slug,
            type: "brokers",
            title: `${o.type}: ${o.amount}`,
            description: o.conditions,
            discount: null,
            code: o.code,
            expires: o.expiry,
          })),
      );
    return NextResponse.json({
      success: true,
      offers: [...promotions, ...bonuses],
    });
  } catch {
    return NextResponse.json(
      { error: "Offers are temporarily unavailable" },
      { status: 503 },
    );
  }
}
