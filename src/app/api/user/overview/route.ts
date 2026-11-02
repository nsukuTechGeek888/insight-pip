import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function GET(r: NextRequest) {
  const u = await requestUser(r);
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [reviews, pending, incidents, saved, comparisons, notifications] =
    await Promise.all([
      prisma.review.count({ where: { userId: u.id } }),
      prisma.review.count({ where: { userId: u.id, status: "PENDING" } }),
      prisma.incident.count({ where: { userId: u.id } }),
      prisma.favorite.count({ where: { userId: u.id } }),
      prisma.comparison.count({ where: { userId: u.id } }),
      prisma.notification.findMany({
        where: { userId: u.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
  return NextResponse.json({
    counts: { reviews, pending, incidents, saved, comparisons },
    notifications,
    emailVerified: !!u.security?.emailVerifiedAt,
  });
}
