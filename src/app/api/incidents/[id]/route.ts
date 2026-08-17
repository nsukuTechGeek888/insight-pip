import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`🔍 Fetching incident with ID: ${id}`);

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    if (!incident) {
      console.log(`❌ Incident not found: ${id}`);
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Found incident: ${incident.title}`);
    
    // Get the entity details (broker or prop firm)
    let entity = null;
    if (incident.entityType === 'broker') {
      entity = await prisma.broker.findUnique({
        where: { id: incident.entityId },
        select: { id: true, name: true, slug: true, logo: true }
      });
    } else {
      entity = await prisma.propFirm.findUnique({
        where: { id: incident.entityId },
        select: { id: true, name: true, slug: true, logo: true }
      });
    }

    // Get related incidents (same type, same entity)
    const relatedIncidents = await prisma.incident.findMany({
      where: {
        entityType: incident.entityType,
        entityId: incident.entityId,
        incidentType: incident.incidentType,
        id: { not: incident.id },
        status: 'APPROVED'
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    // Calculate display status
    const displayStatus = incident.verifiedBadge ? 'VERIFIED' : 
                         incident.proofUrls?.length > 0 ? 'PROOF_SUBMITTED' :
                         incident.disputes > incident.confirmations ? 'DISPUTED' : 'UNVERIFIED';

    // Get entity trends/alerts
    let alerts: any[] = [];
    if (entity && entity.incidentTrends) {
      const trends = JSON.parse(entity.incidentTrends as string);
      alerts = trends.alerts || [];
    }

    return NextResponse.json({
      success: true,
      incident: {
        ...incident,
        displayStatus,
        proofProvided: incident.proofUrls?.length > 0,
        confirmVsDispute: incident.confirmations - incident.disputes,
        trustScore: incident.confirmations + incident.disputes > 0 
          ? Math.round((incident.confirmations / (incident.confirmations + incident.disputes)) * 100)
          : 0,
        entity
      },
      relatedIncidents,
      alerts: alerts.filter((a: any) => a.type === incident.incidentType)
    });

  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}