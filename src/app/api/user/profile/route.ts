// app/api/user/profile/route.ts - UPDATED WITH REGION

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getRegionFromRequest, setRegionCookie } from '@/lib/region';

const prisma = new PrismaClient();

// Helper to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, avatar: true, region: true, createdAt: true, password: true }
    });
    return user;
  } catch {
    return null;
  }
}

// GET /api/user/profile - Get current user profile with stats
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove password from user object for response
    const { password, ...userWithoutPassword } = user;

    // Get user stats
    const [reviewsCount, approvedReviewsCount, pendingReviewsCount, incidentsCount, pendingIncidentsCount, resolvedIncidentsCount, favoritesCount, helpfulVotesReceived] = await Promise.all([
      prisma.review.count({ where: { userId: user.id } }),
      prisma.review.count({ where: { userId: user.id, status: 'APPROVED' } }),
      prisma.review.count({ where: { userId: user.id, status: 'PENDING' } }),
      prisma.incident.count({ where: { userId: user.id } }),
      prisma.incident.count({ where: { userId: user.id, status: 'PENDING' } }),
      prisma.incident.count({ where: { userId: user.id, resolutionStatus: 'RESOLVED' } }),
      prisma.favorite.count({ where: { userId: user.id } }),
      prisma.helpfulVote.count({ where: { userId: user.id } })
    ]);

    // Calculate average trust score from user's reviews
    const userReviews = await prisma.review.findMany({
      where: { userId: user.id, status: 'APPROVED' },
      select: { trustScore: true }
    });
    const avgTrustScore = userReviews.length > 0 
      ? Math.round(userReviews.reduce((sum, r) => sum + (r.trustScore || 0), 0) / userReviews.length)
      : 0;

    // Get recent activity
    const [recentReviews, recentIncidents] = await Promise.all([
      prisma.review.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          broker: { select: { id: true, name: true, slug: true } },
          propFirm: { select: { id: true, name: true, slug: true } }
        }
      }),
      prisma.incident.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Format recent activity
    const formattedRecentReviews = recentReviews.map(review => ({
      id: review.id,
      title: review.title,
      rating: review.rating,
      trustScore: review.trustScore,
      status: review.status,
      createdAt: review.createdAt,
      entityId: review.brokerId || review.propFirmId,
      entityName: review.broker?.name || review.propFirm?.name,
      entityType: review.brokerId ? 'broker' : 'propFirm',
      entitySlug: review.broker?.slug || review.propFirm?.slug,
      helpfulCount: review.helpfulCount
    }));

    const formattedRecentIncidents = recentIncidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      incidentType: incident.incidentType,
      status: incident.status,
      resolutionStatus: incident.resolutionStatus,
      createdAt: incident.createdAt,
      incidentDate: incident.incidentDate,
      entityId: incident.entityId,
      entityType: incident.entityType,
      confirmations: incident.confirmations,
      disputes: incident.disputes,
      verifiedBadge: incident.verifiedBadge
    }));

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        stats: {
          totalReviews: reviewsCount,
          approvedReviews: approvedReviewsCount,
          pendingReviews: pendingReviewsCount,
          totalIncidents: incidentsCount,
          pendingIncidents: pendingIncidentsCount,
          resolvedIncidents: resolvedIncidentsCount,
          totalFavorites: favoritesCount,
          helpfulReceived: helpfulVotesReceived,
          avgTrustScore
        }
      },
      recentActivity: {
        reviews: formattedRecentReviews,
        incidents: formattedRecentIncidents
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/user/profile - Update user profile (including region)
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar, region } = body;

    const updateData: any = {
      name: name !== undefined ? name : undefined,
      avatar: avatar !== undefined ? avatar : undefined,
    };

    // Allow updating region
    if (region !== undefined) {
      updateData.region = region;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, avatar: true, region: true, createdAt: true }
    });

    // Create response with region cookie
    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

    // If region was updated, update the cookie
    if (region) {
      setRegionCookie(response, region);
    }

    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/user/profile/password - Change password
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/user/profile - Delete user account (optional)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required to delete account' }, { status: 400 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 400 });
    }

    // Delete user and all related data (cascade will handle relations)
    await prisma.user.delete({
      where: { id: user.id }
    });

    // Clear auth cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
    response.cookies.delete('auth_token');
    response.cookies.delete('user_region');

    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}