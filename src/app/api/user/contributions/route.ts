import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    return await prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user contributions (reviews and incidents)
    const [reviews, incidents] = await Promise.all([
      prisma.review.findMany({
        where: { userId: user.id },
        select: { 
          id: true, 
          title: true, 
          createdAt: true, 
          status: true, 
          helpfulCount: true,
          rating: true,
          broker: { select: { name: true } },
          propFirm: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.incident.findMany({
        where: { userId: user.id },
        select: { 
          id: true, 
          title: true, 
          createdAt: true, 
          status: true, 
          confirmations: true,
          incidentType: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Combine and format contributions
    const contributions = [
      ...reviews.map(r => ({ 
        ...r, 
        type: 'review',
        entityName: r.broker?.name || r.propFirm?.name || 'Unknown'
      })),
      ...incidents.map(i => ({ 
        ...i, 
        type: 'incident' 
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get monthly breakdown for calendar visualization
    const monthlyBreakdown = contributions.reduce((acc, c) => {
      const date = new Date(c.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!acc[key]) acc[key] = { reviews: 0, incidents: 0, total: 0 };
      if (c.type === 'review') acc[key].reviews++;
      else acc[key].incidents++;
      acc[key].total++;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      contributions,
      monthlyBreakdown,
      totalContributions: contributions.length
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}