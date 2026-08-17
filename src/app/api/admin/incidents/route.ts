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
      select: { id: true, role: true, name: true, email: true }
    });
    
    if (user?.role !== 'ADMIN') return null;
    return user;
  } catch { 
    return null; 
  }
}

// GET /api/admin/incidents - Get all incidents with filters
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';
    const entityType = searchParams.get('entityType') || '';
    const entityId = searchParams.get('entityId') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== 'all') where.status = status;
    if (type !== 'all') where.incidentType = type;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = parseInt(entityId);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              avatar: true,
              role: true
            } 
          },
          broker: { 
            select: { 
              id: true, 
              name: true,
              slug: true
            } 
          },
          propFirm: { 
            select: { 
              id: true, 
              name: true,
              slug: true
            } 
          }
        }
      }),
      prisma.incident.count({ where })
    ]);

    // Format incidents with display status
    const formattedIncidents = incidents.map(incident => ({
      ...incident,
      displayStatus: incident.verifiedBadge ? 'VERIFIED' : 
                     incident.proofUrls?.length > 0 ? 'PROOF_SUBMITTED' :
                     incident.disputes > incident.confirmations ? 'DISPUTED' : 'UNVERIFIED'
    }));

    return NextResponse.json({
      success: true,
      incidents: formattedIncidents,
      pagination: { 
        page, 
        limit, 
        total, 
        pages: Math.ceil(total / limit) 
      }
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch incidents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}