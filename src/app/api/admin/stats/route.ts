import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (user?.role !== 'ADMIN') return null;
    return user;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalUsers,
      totalReviews,
      pendingReviews,
      totalIncidents,
      pendingIncidents,
      totalBrokers,
      totalPropFirms,
      recentReviews,
      recentIncidents,
      reviewStats,
      incidentStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.incident.count(),
      prisma.incident.count({ where: { status: 'PENDING' } }),
      prisma.broker.count(),
      prisma.propFirm.count(),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.incident.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.review.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.incident.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        users: totalUsers,
        reviews: { total: totalReviews, pending: pendingReviews, breakdown: reviewStats },
        incidents: { total: totalIncidents, pending: pendingIncidents, breakdown: incidentStats },
        brokers: totalBrokers,
        propFirms: totalPropFirms
      },
      recent: {
        reviews: recentReviews,
        incidents: recentIncidents
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}