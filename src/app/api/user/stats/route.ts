import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  console.log('🔑 Stats API - Token present:', !!token);
  
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "development-secret-key-12345"
    ) as { userId: string };
    console.log('✅ Stats API - Decoded user ID:', decoded.userId);
    
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true }
    });
    console.log('✅ Stats API - User found:', user?.email);
    return user;
  } catch (error) { 
    console.error('❌ Stats API - Token verification error:', error);
    return null; 
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Stats API called');
    
    const user = await getUserFromToken(request);
    if (!user) {
      console.log('❌ Stats API - No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📊 Stats API - Fetching data for user:', user.id);

    // Get user's reviews
    let reviews = [];
    try {
      reviews = await prisma.review.findMany({
        where: { userId: user.id },
        select: { 
          id: true, 
          status: true, 
          rating: true, 
          helpfulCount: true, 
          trustScore: true, 
          createdAt: true,
          title: true,
          broker: { select: { name: true } },
          propFirm: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`✅ Stats API - Found ${reviews.length} reviews`);
    } catch (err) {
      console.error('❌ Stats API - Error fetching reviews:', err);
    }

    // Get user's incidents
    let incidents = [];
    try {
      incidents = await prisma.incident.findMany({
        where: { userId: user.id },
        select: { 
          id: true, 
          status: true, 
          confirmations: true, 
          disputes: true, 
          createdAt: true,
          title: true,
          incidentType: true,
          resolutionStatus: true
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`✅ Stats API - Found ${incidents.length} incidents`);
    } catch (err) {
      console.error('❌ Stats API - Error fetching incidents:', err);
    }

    // Get helpful votes given
    let helpfulGiven = 0;
    try {
      helpfulGiven = await prisma.helpfulVote.count({
        where: { userId: user.id }
      });
      console.log(`✅ Stats API - Helpful given: ${helpfulGiven}`);
    } catch (err) {
      console.error('❌ Stats API - Error fetching helpful votes:', err);
    }

    // Get favorites count
    let totalFavorites = 0;
    try {
      totalFavorites = await prisma.favorite.count({ 
        where: { userId: user.id } 
      });
      console.log(`✅ Stats API - Favorites: ${totalFavorites}`);
    } catch (err) {
      console.error('❌ Stats API - Error fetching favorites:', err);
    }

    // Calculate review stats
    const totalReviews = reviews.length;
    const approvedReviews = reviews.filter(r => r.status === 'APPROVED').length;
    const pendingReviews = reviews.filter(r => r.status === 'PENDING').length;
    const rejectedReviews = reviews.filter(r => r.status === 'REJECTED').length;
    const helpfulReceived = reviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);
    
    // Calculate incident stats
    const totalIncidents = incidents.length;
    const resolvedIncidents = incidents.filter(i => i.status === 'APPROVED' || i.resolutionStatus === 'RESOLVED').length;
    const pendingIncidents = incidents.filter(i => i.status === 'PENDING').length;
    const verifiedIncidents = incidents.filter(i => i.verifiedBadge === true).length;
    
    // Calculate average trust score
    const approvedReviewsWithTrust = reviews.filter(r => r.status === 'APPROVED' && r.trustScore);
    let avgTrustScore = 0;
    if (approvedReviewsWithTrust.length > 0) {
      const totalTrust = approvedReviewsWithTrust.reduce((sum, r) => sum + (r.trustScore || 0), 0);
      avgTrustScore = Math.round(totalTrust / approvedReviewsWithTrust.length);
    }

    // Calculate impact score
    let impactScore = 0;
    impactScore += Math.min(40, helpfulReceived * 2);
    impactScore += Math.min(30, approvedReviews * 5);
    impactScore += Math.min(20, resolvedIncidents * 4);
    impactScore += Math.min(10, helpfulGiven);
    impactScore = Math.min(100, impactScore);

    const responseData = {
      success: true,
      stats: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        rejectedReviews,
        totalIncidents,
        resolvedIncidents,
        pendingIncidents,
        verifiedIncidents,
        totalFavorites,
        helpfulReceived,
        helpfulGiven,
        avgTrustScore,
        impactScore
      },
      recentActivity: {
        reviews: reviews.slice(0, 5).map(review => ({
          id: review.id,
          title: review.title,
          status: review.status,
          rating: review.rating,
          helpfulCount: review.helpfulCount,
          createdAt: review.createdAt,
          entityName: review.broker?.name || review.propFirm?.name || 'Unknown'
        })),
        incidents: incidents.slice(0, 5).map(incident => ({
          id: incident.id,
          title: incident.title,
          status: incident.status,
          resolutionStatus: incident.resolutionStatus,
          confirmations: incident.confirmations,
          disputes: incident.disputes,
          createdAt: incident.createdAt,
          incidentType: incident.incidentType
        }))
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    };

    console.log('✅ Stats API - Sending response with stats:', {
      totalReviews,
      approvedReviews,
      totalIncidents,
      avgTrustScore
    });

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ Stats API - Fatal error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats', details: error.message }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}