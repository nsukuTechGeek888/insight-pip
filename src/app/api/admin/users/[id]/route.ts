import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getAdminUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });
    return user;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminUser(request);
    
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get('include')?.includes('reviews') || false;
    const includeReplies = searchParams.get('include')?.includes('replies') || false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reviews: true,
            incidents: true,
            favorites: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get reviews with full details
    let reviews: any[] = [];
    if (includeReviews) {
      reviews = await prisma.review.findMany({
        where: { userId },
        include: {
          broker: { select: { name: true } },
          propFirm: { select: { name: true } },
          replies: {
            include: {
              user: { select: { name: true, email: true } },
              broker: { select: { name: true } },
              propFirm: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          votes: true,
          reports: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Get review replies
    let reviewReplies: any[] = [];
    if (includeReplies) {
      reviewReplies = await prisma.reviewReply.findMany({
        where: { userId },
        include: {
          review: {
            select: {
              id: true,
              title: true,
              broker: { select: { name: true } },
              propFirm: { select: { name: true } }
            }
          },
          user: { select: { name: true, email: true } },
          broker: { select: { name: true } },
          propFirm: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Get incidents
    const incidents = await prisma.incident.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const [reviewsStats, helpfulGiven] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        select: { status: true, rating: true, helpfulCount: true, trustScore: true, reportCount: true }
      }),
      prisma.helpfulVote.count({ where: { userId } })
    ]);

    const totalReviews = reviewsStats.length;
    const approvedReviews = reviewsStats.filter(r => r.status === 'APPROVED').length;
    const pendingReviews = reviewsStats.filter(r => r.status === 'PENDING').length;
    const rejectedReviews = reviewsStats.filter(r => r.status === 'REJECTED').length;
    const reportedReviews = reviewsStats.filter(r => (r.reportCount || 0) > 0).length;
    
    const totalIncidents = incidents.length;
    const resolvedIncidents = incidents.filter(i => i.status === 'APPROVED' || i.resolutionStatus === 'RESOLVED').length;
    const pendingIncidents = incidents.filter(i => i.status === 'PENDING').length;
    
    const helpfulReceived = reviewsStats.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);
    
    const approvedWithTrust = reviewsStats.filter(r => r.status === 'APPROVED' && r.trustScore);
    let avgTrustScore = 0;
    if (approvedWithTrust.length > 0) {
      const totalTrust = approvedWithTrust.reduce((sum, r) => sum + (r.trustScore || 0), 0);
      avgTrustScore = Math.round(totalTrust / approvedWithTrust.length);
    }

    let impactScore = 0;
    impactScore += Math.min(40, helpfulReceived * 2);
    impactScore += Math.min(30, approvedReviews * 5);
    impactScore += Math.min(20, resolvedIncidents * 4);
    impactScore += Math.min(10, helpfulGiven);

    const userWithStats = {
      ...user,
      stats: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        rejectedReviews,
        reportedReviews,
        totalIncidents,
        resolvedIncidents,
        pendingIncidents,
        totalFavorites: user._count.favorites,
        helpfulReceived,
        helpfulGiven,
        avgTrustScore,
        impactScore: Math.min(100, impactScore)
      },
      recentActivity: {
        reviews: reviews.slice(0, 5).map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          rating: r.rating,
          createdAt: r.createdAt,
          entityName: r.broker?.name || r.propFirm?.name || 'Unknown',
          helpfulCount: r.helpfulCount
        })),
        incidents: incidents.slice(0, 5).map(i => ({
          id: i.id,
          title: i.title,
          status: i.status,
          incidentType: i.incidentType,
          resolutionStatus: i.resolutionStatus,
          createdAt: i.createdAt,
          confirmations: i.confirmations
        }))
      },
      reviews: includeReviews ? reviews : undefined,
      reviewReplies: includeReplies ? reviewReplies : undefined,
      _count: user._count
    };

    return NextResponse.json({
      success: true,
      user: userWithStats
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}