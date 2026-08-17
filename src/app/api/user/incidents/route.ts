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

// GET /api/user/incidents - Get current user's incidents
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

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where: { userId: user.id },
        include: {
          broker: { select: { id: true, name: true, slug: true } },
          propFirm: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.incident.count({ where: { userId: user.id } })
    ]);

    const formattedIncidents = incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      incidentType: incident.incidentType,
      status: incident.status,
      resolutionStatus: incident.resolutionStatus,
      createdAt: incident.createdAt,
      incidentDate: incident.incidentDate,
      entityId: incident.brokerId || incident.propFirmId,
      entityName: incident.broker?.name || incident.propFirm?.name,
      entityType: incident.brokerId ? 'broker' : 'propFirm',
      entitySlug: incident.broker?.slug || incident.propFirm?.slug,
      confirmations: incident.confirmations,
      disputes: incident.disputes,
      verifiedBadge: incident.verifiedBadge,
      proofProvided: incident.proofUrls?.length > 0,
    }));

    return NextResponse.json({
      success: true,
      incidents: formattedIncidents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching user incidents:', error);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}