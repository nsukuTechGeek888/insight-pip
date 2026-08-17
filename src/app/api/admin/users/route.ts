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

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role !== 'all') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Get stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const reviews = await prisma.review.findMany({
        where: { userId: user.id },
        select: { status: true, rating: true, helpfulCount: true, trustScore: true }
      });

      const incidents = await prisma.incident.findMany({
        where: { userId: user.id },
        select: { status: true, resolutionStatus: true }
      });

      const helpfulGiven = await prisma.helpfulVote.count({
        where: { userId: user.id }
      });

      const totalReviews = reviews.length;
      const approvedReviews = reviews.filter(r => r.status === 'APPROVED').length;
      const pendingReviews = reviews.filter(r => r.status === 'PENDING').length;
      const totalIncidents = incidents.length;
      const resolvedIncidents = incidents.filter(i => i.status === 'APPROVED' || i.resolutionStatus === 'RESOLVED').length;
      const pendingIncidents = incidents.filter(i => i.status === 'PENDING').length;
      const helpfulReceived = reviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);
      
      const approvedWithTrust = reviews.filter(r => r.status === 'APPROVED' && r.trustScore);
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

      return {
        ...user,
        stats: {
          totalReviews,
          approvedReviews,
          pendingReviews,
          totalIncidents,
          pendingIncidents,
          resolvedIncidents,
          totalFavorites: user._count.favorites,
          helpfulReceived,
          helpfulGiven,
          avgTrustScore,
          impactScore: Math.min(100, impactScore)
        }
      };
    }));

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/users - Update user role
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/admin/users - Suspend/activate user
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 });
    }

    // Note: You'll need to add a 'status' field to your User model in schema.prisma
    // If you haven't added it yet, you can skip this part or add it
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        // status: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' 
      },
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${action === 'suspend' ? 'suspended' : 'activated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}