import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });
  } catch {
    return null;
  }
}

// GET /api/user/reviews - Get current user's reviews
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: user.id },
        include: {
          broker: { select: { id: true, name: true, slug: true, logo: true } },
          propFirm: { select: { id: true, name: true, slug: true, logo: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { userId: user.id } })
    ]);

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      status: review.status,
      createdAt: review.createdAt,
      entityId: review.brokerId || review.propFirmId,
      entityName: review.broker?.name || review.propFirm?.name,
      entityType: review.brokerId ? 'broker' : 'propFirm',
      entitySlug: review.broker?.slug || review.propFirm?.slug,
      helpfulCount: review.helpfulCount,
      trustScore: review.trustScore,
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/user/reviews/[id] - Delete a review
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.review.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}