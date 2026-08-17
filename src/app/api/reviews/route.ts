import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to verify custom JWT token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  console.log('🔑 Token from cookie:', token ? 'Present' : 'Not present');
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "development-secret-key-12345"
    ) as { userId: string; email: string };
    
    console.log('✅ Token verified for user:', decoded.email);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true,
        role: true 
      }
    });
    
    return user;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return null;
  }
}

// Helper function to calculate trust score
function calculateTrustScore(data: any): number {
  let score = 0;
  let totalWeight = 0;
  
  // Withdrawal Experience (40%)
  if (data.withdrawalExperience && data.withdrawalExperience > 0) {
    score += (data.withdrawalExperience / 5) * 40;
    totalWeight += 40;
  } else if (data.withdrawalSpeed === 'Still Waiting') {
    score += 0;
    totalWeight += 40;
  } else if (data.withdrawalSpeed) {
    const speedScores: Record<string, number> = {
      'Same Day': 5,
      '1-3 Days': 4,
      '3-7 Days': 3,
      '7+ Days': 2,
      'Still Waiting': 0
    };
    score += (speedScores[data.withdrawalSpeed] / 5) * 40;
    totalWeight += 40;
  }
  
  // Execution Quality (20%)
  if (data.executionQuality && data.executionQuality > 0) {
    score += (data.executionQuality / 5) * 20;
    totalWeight += 20;
  }
  
  // Reliability (20%)
  if (data.reliability && data.reliability > 0) {
    score += (data.reliability / 5) * 20;
    totalWeight += 20;
  }
  
  // Customer Support (10%)
  if (data.customerSupport && data.customerSupport > 0) {
    score += (data.customerSupport / 5) * 10;
    totalWeight += 10;
  }
  
  // Recommendation (10%)
  if (data.wouldRecommend === 'Yes') {
    score += 10;
    totalWeight += 10;
  } else if (data.wouldRecommend === 'No') {
    score += 0;
    totalWeight += 10;
  }
  
  // Account Issues (penalty)
  if (data.accountIssues && data.accountIssues !== 'No Issues' && data.accountIssues !== '') {
    score = score * 0.8;
  }
  
  // If no weighted fields, return default
  if (totalWeight === 0) {
    return 50;
  }
  
  return Math.min(100, Math.round((score / totalWeight) * 100));
}

// Helper function to update broker statistics
async function updateBrokerStats(brokerId: number) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        brokerId,
        status: 'APPROVED'
      }
    });
    
    if (reviews.length === 0) return;
    
    const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
    
    const avgWithdrawalSuccess = reviews
      .filter(r => r.withdrawalExperience)
      .reduce((sum, r) => sum + (r.withdrawalExperience || 0), 0) / 
      (reviews.filter(r => r.withdrawalExperience).length || 1);
    
    const avgExecutionQuality = reviews
      .filter(r => r.executionQuality)
      .reduce((sum, r) => sum + (r.executionQuality || 0), 0) / 
      (reviews.filter(r => r.executionQuality).length || 1);
    
    const avgReliability = reviews
      .filter(r => r.reliability)
      .reduce((sum, r) => sum + (r.reliability || 0), 0) / 
      (reviews.filter(r => r.reliability).length || 1);
    
    const recommendationRate = (reviews.filter(r => r.wouldRecommend === 'Yes').length / reviews.length) * 100;
    
    const withdrawalStats = {
      sameDay: reviews.filter(r => r.withdrawalSpeed === 'Same Day').length,
      oneToThreeDays: reviews.filter(r => r.withdrawalSpeed === '1-3 Days').length,
      threeToSevenDays: reviews.filter(r => r.withdrawalSpeed === '3-7 Days').length,
      sevenPlusDays: reviews.filter(r => r.withdrawalSpeed === '7+ Days').length,
      stillWaiting: reviews.filter(r => r.withdrawalSpeed === 'Still Waiting').length,
    };
    
    const accountIssueStats = {
      noIssues: reviews.filter(r => r.accountIssues === 'No Issues').length,
      temporarySuspension: reviews.filter(r => r.accountIssues === 'Temporary Account Suspension').length,
      withdrawalDelayed: reviews.filter(r => r.accountIssues === 'Withdrawal Delayed').length,
      withdrawalRejected: reviews.filter(r => r.accountIssues === 'Withdrawal Rejected').length,
      accountTerminated: reviews.filter(r => r.accountIssues === 'Account Terminated').length,
      ruleViolation: reviews.filter(r => r.accountIssues === 'Rule Violation Dispute').length,
    };
    
    await prisma.broker.update({
      where: { id: brokerId },
      data: {
        avgTrustScore,
        avgWithdrawalSuccess,
        avgExecutionQuality,
        avgReliability,
        recommendationRate,
        withdrawalStats: JSON.stringify(withdrawalStats),
        accountIssueStats: JSON.stringify(accountIssueStats),
        avgWithdrawalExperience: avgWithdrawalSuccess,
        avgReliability: avgReliability,
        avgCustomerSupport: reviews
          .filter(r => r.customerSupport)
          .reduce((sum, r) => sum + (r.customerSupport || 0), 0) / 
          (reviews.filter(r => r.customerSupport).length || 1),
      }
    });
    
  } catch (error) {
    console.error('Error updating broker stats:', error);
  }
}

// Helper function to update prop firm statistics
async function updatePropFirmStats(propFirmId: number) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        propFirmId,
        status: 'APPROVED'
      }
    });
    
    if (reviews.length === 0) return;
    
    const avgTrustScore = reviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / reviews.length;
    
    const avgWithdrawalSuccess = reviews
      .filter(r => r.withdrawalExperience)
      .reduce((sum, r) => sum + (r.withdrawalExperience || 0), 0) / 
      (reviews.filter(r => r.withdrawalExperience).length || 1);
    
    const avgExecutionQuality = reviews
      .filter(r => r.executionQuality)
      .reduce((sum, r) => sum + (r.executionQuality || 0), 0) / 
      (reviews.filter(r => r.executionQuality).length || 1);
    
    const avgReliability = reviews
      .filter(r => r.reliability)
      .reduce((sum, r) => sum + (r.reliability || 0), 0) / 
      (reviews.filter(r => r.reliability).length || 1);
    
    const recommendationRate = (reviews.filter(r => r.wouldRecommend === 'Yes').length / reviews.length) * 100;
    
    const withdrawalStats = {
      sameDay: reviews.filter(r => r.withdrawalSpeed === 'Same Day').length,
      oneToThreeDays: reviews.filter(r => r.withdrawalSpeed === '1-3 Days').length,
      threeToSevenDays: reviews.filter(r => r.withdrawalSpeed === '3-7 Days').length,
      sevenPlusDays: reviews.filter(r => r.withdrawalSpeed === '7+ Days').length,
      stillWaiting: reviews.filter(r => r.withdrawalSpeed === 'Still Waiting').length,
    };
    
    const accountIssueStats = {
      noIssues: reviews.filter(r => r.accountIssues === 'No Issues').length,
      temporarySuspension: reviews.filter(r => r.accountIssues === 'Temporary Account Suspension').length,
      withdrawalDelayed: reviews.filter(r => r.accountIssues === 'Withdrawal Delayed').length,
      withdrawalRejected: reviews.filter(r => r.accountIssues === 'Withdrawal Rejected').length,
      accountTerminated: reviews.filter(r => r.accountIssues === 'Account Terminated').length,
      ruleViolation: reviews.filter(r => r.accountIssues === 'Rule Violation Dispute').length,
    };
    
    await prisma.propFirm.update({
      where: { id: propFirmId },
      data: {
        avgTrustScore,
        avgWithdrawalSuccess,
        avgExecutionQuality,
        avgReliability,
        recommendationRate,
        withdrawalStats: JSON.stringify(withdrawalStats),
        accountIssueStats: JSON.stringify(accountIssueStats),
      }
    });
    
  } catch (error) {
    console.error('Error updating prop firm stats:', error);
  }
}

// GET /api/reviews - List reviews with filters
export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/reviews started');
    const { searchParams } = new URL(request.url);
    
    const brokerId = searchParams.get('brokerId');
    const propFirmId = searchParams.get('propFirmId');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'APPROVED';
    const search = searchParams.get('search') || '';

    console.log('📥 Params:', { brokerId, propFirmId, type, userId, page, limit, sort, status, search });

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (brokerId) where.brokerId = parseInt(brokerId);
    if (propFirmId) where.propFirmId = parseInt(propFirmId);
    
    if (type === 'broker' && !brokerId) {
      where.brokerId = { not: null };
    } else if (type === 'propFirm' && !propFirmId) {
      where.propFirmId = { not: null };
    }
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { pros: { contains: search, mode: 'insensitive' } },
        { cons: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { broker: { name: { contains: search, mode: 'insensitive' } } },
        { propFirm: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    console.log('📥 Where clause:', where);

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
      case 'trust-score':
        orderBy = { trustScore: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

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
          broker: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            }
          },
          propFirm: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            }
          },
          _count: {
            select: {
              votes: true,
              replies: true,
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    console.log(`📥 Found ${reviews.length} reviews (total: ${total})`);

    const transformedReviews = reviews.map(review => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      experienceLevel: review.experienceLevel,
      yearsTrading: review.yearsTrading,
      tradingStyle: review.tradingStyle,
      tradingEnvironment: review.tradingEnvironment,
      platformStability: review.platformStability,
      executionQuality: review.executionQuality,
      withdrawalExperience: review.withdrawalExperience,
      depositExperience: review.depositExperience,
      customerSupport: review.customerSupport,
      reliability: review.reliability,
      value: review.value,
      withdrawalSpeed: review.withdrawalSpeed,
      accountIssues: review.accountIssues,
      wouldRecommend: review.wouldRecommend,
      trustScore: review.trustScore,
      pros: review.pros,
      cons: review.cons,
      isVerified: review.isVerified || false,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user,
      helpfulCount: review._count?.votes || 0,
      replyCount: review._count?.replies || 0,
      entityId: review.brokerId || review.propFirmId,
      entityName: review.broker?.name || review.propFirm?.name,
      entityType: review.brokerId ? 'broker' : 'propFirm',
      entityLogo: review.broker?.logo || review.propFirm?.logo,
      entitySlug: review.broker?.slug || review.propFirm?.slug,
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error in GET /api/reviews:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviews', 
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review (FIXED VERSION)
export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/reviews started');
    
    // Get authenticated user
    const user = await getUserFromToken(request);
    
    if (!user) {
      console.log('❌ No user found from token');
      return NextResponse.json(
        { error: 'You must be logged in to write a review' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id, user.email);

    // Parse the request body
    const body = await request.json();
    console.log('📥 Request body:', JSON.stringify(body, null, 2));

    // SIMPLE VALIDATION - Only check required fields
    if (!body.title || body.title.trim().length < 2) {
      return NextResponse.json(
        { error: 'Title must be at least 2 characters' },
        { status: 400 }
      );
    }
    
    if (!body.content || body.content.trim().length < 5) {
      return NextResponse.json(
        { error: 'Content must be at least 5 characters' },
        { status: 400 }
      );
    }
    
    if (!body.brokerId && !body.propFirmId) {
      return NextResponse.json(
        { error: 'Either brokerId or propFirmId is required' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this entity
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        ...(body.brokerId ? { brokerId: body.brokerId } : {}),
        ...(body.propFirmId ? { propFirmId: body.propFirmId } : {})
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this item' },
        { status: 400 }
      );
    }

    // Calculate overall rating from provided ratings
    let overallRating = 3; // Default rating
    
    const ratingValues = [
      body.platformStability,
      body.executionQuality,
      body.withdrawalExperience,
      body.depositExperience,
      body.customerSupport,
      body.reliability,
      body.value
    ].filter(r => r && r > 0 && r <= 5);
    
    if (ratingValues.length > 0) {
      overallRating = Math.round(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length);
    }

    // Calculate trust score
    const trustScore = calculateTrustScore(body);

    // Prepare data for database - ONLY include fields that have valid values
    const reviewData: any = {
      title: body.title.trim(),
      content: body.content.trim(),
      rating: overallRating,
      trustScore: trustScore,
      userId: user.id,
      status: 'APPROVED',
    };
    
    // Add entity ID (broker or prop firm)
    if (body.brokerId) {
      reviewData.brokerId = body.brokerId;
    }
    if (body.propFirmId) {
      reviewData.propFirmId = body.propFirmId;
    }
    
    // Add trader profile fields (only if they have valid values)
    if (body.experienceLevel && ['Beginner', 'Intermediate', 'Advanced', 'Professional'].includes(body.experienceLevel)) {
      reviewData.experienceLevel = body.experienceLevel;
    }
    if (body.yearsTrading && ['<1', '1-2', '3-5', '5-10', '10+'].includes(body.yearsTrading)) {
      reviewData.yearsTrading = body.yearsTrading;
    }
    if (body.tradingStyle && ['Scalper', 'Day Trader', 'Swing Trader', 'Position Trader', 'News Trader', 'EA / Algorithmic Trader'].includes(body.tradingStyle)) {
      reviewData.tradingStyle = body.tradingStyle;
    }
    if (body.tradingEnvironment && ['Live Account', 'Demo Account', 'Prop Firm Account'].includes(body.tradingEnvironment)) {
      reviewData.tradingEnvironment = body.tradingEnvironment;
    }
    
    // Add rating fields (only if between 1-5)
    if (body.platformStability >= 1 && body.platformStability <= 5) reviewData.platformStability = body.platformStability;
    if (body.executionQuality >= 1 && body.executionQuality <= 5) reviewData.executionQuality = body.executionQuality;
    if (body.withdrawalExperience >= 1 && body.withdrawalExperience <= 5) reviewData.withdrawalExperience = body.withdrawalExperience;
    if (body.depositExperience >= 1 && body.depositExperience <= 5) reviewData.depositExperience = body.depositExperience;
    if (body.customerSupport >= 1 && body.customerSupport <= 5) reviewData.customerSupport = body.customerSupport;
    if (body.reliability >= 1 && body.reliability <= 5) reviewData.reliability = body.reliability;
    if (body.value >= 1 && body.value <= 5) reviewData.value = body.value;
    
    // Add trust signal fields (only if they have valid values)
    if (body.withdrawalSpeed && ['Same Day', '1-3 Days', '3-7 Days', '7+ Days', 'Still Waiting'].includes(body.withdrawalSpeed)) {
      reviewData.withdrawalSpeed = body.withdrawalSpeed;
    }
    if (body.accountIssues && ['No Issues', 'Temporary Account Suspension', 'Withdrawal Delayed', 'Withdrawal Rejected', 'Account Terminated', 'Rule Violation Dispute'].includes(body.accountIssues)) {
      reviewData.accountIssues = body.accountIssues;
    }
    if (body.wouldRecommend && ['Yes', 'No'].includes(body.wouldRecommend)) {
      reviewData.wouldRecommend = body.wouldRecommend;
    }
    
    // Add legacy fields
    if (body.pros) reviewData.pros = body.pros;
    if (body.cons) reviewData.cons = body.cons;
    if (body.verifiedTrader !== undefined) reviewData.verifiedTrader = body.verifiedTrader;

    console.log('Creating review with data:', JSON.stringify(reviewData, null, 2));

    // Create the review
    const review = await prisma.review.create({
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        broker: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          }
        },
        propFirm: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          }
        }
      }
    });

    console.log('✅ Review created successfully! ID:', review.id);

    // Update broker or prop firm stats
    if (body.brokerId) {
      await updateBrokerStats(body.brokerId);
    } else if (body.propFirmId) {
      await updatePropFirmStats(body.propFirmId);
    }

    // Transform the response
    const transformedReview = {
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      trustScore: review.trustScore,
      createdAt: review.createdAt,
      user: review.user,
      entityId: review.brokerId || review.propFirmId,
      entityName: review.broker?.name || review.propFirm?.name,
      entityType: review.brokerId ? 'broker' : 'propFirm',
      entitySlug: review.broker?.slug || review.propFirm?.slug,
    };

    return NextResponse.json(transformedReview, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/reviews:', error);
    
    // Check for Prisma errors
    if (error.code) {
      console.error('Prisma error code:', error.code);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}