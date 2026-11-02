import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getUserFromToken(request: NextRequest) {
  return requestUser(request);
}

// GET /api/user/reviews - Get current user's reviews
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: user.id },
        include: {
          broker: { select: { id: true, name: true, slug: true, logo: true } },
          propFirm: {
            select: { id: true, name: true, slug: true, logo: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { userId: user.id } }),
    ]);

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      status: review.status,
      moderationNote: review.moderationNote,
      isHidden: review.isHidden,
      createdAt: review.createdAt,
      entityId: review.brokerId || review.propFirmId,
      entityName: review.broker?.name || review.propFirm?.name,
      entityType: review.brokerId ? "broker" : "propFirm",
      entitySlug: review.broker?.slug || review.propFirm?.slug,
      helpfulCount: review.helpfulCount,
      trustScore: review.trustScore,
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/reviews/[id] - Delete a review
export async function DELETE(request:NextRequest){const id=request.nextUrl.searchParams.get('id');if(!id)return NextResponse.json({error:'Review required'},{status:400});const {DELETE:retract}=await import('@/app/api/reviews/[id]/route');return retract(request,{params:Promise.resolve({id})});}
