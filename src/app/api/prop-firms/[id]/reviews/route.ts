import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/prop-firms/[id]/reviews - Get all reviews for a specific prop firm
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';
    const rating = searchParams.get('rating'); // filter by rating

    const skip = (page - 1) * limit;
    const propFirmId = parseInt(params.id);

    // Check if prop firm exists
    const propFirm = await prisma.propFirm.findUnique({
      where: { id: propFirmId }
    });

    if (!propFirm) {
      return NextResponse.json(
        { error: 'Prop firm not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: any = {
      propFirmId,
      status: 'APPROVED' // Only show approved reviews
    };

    if (rating) {
      where.rating = parseInt(rating);
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'most-helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get reviews with pagination
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
            }
          },
          _count: {
            select: {
              helpfulVotes: true,
              replies: true,
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        propFirmId,
        status: 'APPROVED'
      },
      _count: true
    });

    const distribution = Array.from({ length: 5 }, (_, i) => {
      const ratingData = ratingDistribution.find(r => r.rating === i + 1);
      return {
        rating: i + 1,
        count: ratingData?._count || 0,
        percentage: total > 0 ? ((ratingData?._count || 0) / total) * 100 : 0
      };
    });

    return NextResponse.json({
      reviews,
      propFirm: {
        id: propFirm.id,
        name: propFirm.name,
        rating: propFirm.rating,
        reviewsCount: propFirm.reviewsCount,
      },
      ratingDistribution: distribution,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching prop firm reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}