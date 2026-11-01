import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegionFromRequest, isAvailableInRegion } from "@/lib/region";
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;
    const ids = [...new Set((q.get("ids") || "").split(",").map(Number))];
    if (
      !ids.length ||
      ids.length > 3 ||
      ids.some((n) => !Number.isSafeInteger(n) || n < 1)
    )
      return NextResponse.json(
        { error: "Select between one and three providers" },
        { status: 400 },
      );
    const type = q.get("type") === "prop-firms" ? "prop-firms" : "brokers";
    const region = getRegionFromRequest(request);
    const common = {
      id: true,
      name: true,
      slug: true,
      logo: true,
      founded: true,
      headquarters: true,
      website: true,
      updatedAt: true,
      regions: true,
      restrictedRegions: true,
      platforms: true,
    };
    const data =
      type === "brokers"
        ? await prisma.broker.findMany({
            where: { id: { in: ids }, status: "ACTIVE" },
            select: {
              ...common,
              minDeposit: true,
              maxLeverage: true,
              averageSpreads: true,
              commissions: true,
              depositMethods: true,
              withdrawalMethods: true,
              withdrawalFee: true,
              withdrawalProcessingTime: true,
              accountTypes: true,
            },
          })
        : await prisma.propFirm.findMany({
            where: { id: { in: ids }, status: "ACTIVE" },
            select: {
              ...common,
              maxAccountSize: true,
              payoutFrequency: true,
              payoutProcessingTime: true,
              payoutMethods: true,
              minimumPayout: true,
              programs: true,
            },
          });
    return NextResponse.json({
      success: true,
      data: data
        .filter((p) => isAvailableInRegion(p, region))
        .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)),
    });
  } catch {
    return NextResponse.json(
      { error: "Comparison data is unavailable" },
      { status: 503 },
    );
  }
}
