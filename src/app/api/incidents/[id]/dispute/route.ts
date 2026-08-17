import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to verify custom JWT token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "development-secret-key-12345"
    ) as { userId: string; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });
    
    return user;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return null;
  }
}

// Helper to update entity metrics
async function updateEntityMetrics(entityType: string, entityId: number) {
  try {
    const incidents = await prisma.incident.findMany({
      where: {
        entityType,
        entityId,
        status: 'APPROVED'
      }
    });

    const disputedIncidents = incidents.filter(i => i.disputes > i.confirmations).length;

    if (entityType === 'broker') {
      await prisma.broker.update({
        where: { id: entityId },
        data: { disputedIncidents }
      });
    } else {
      await prisma.propFirm.update({
        where: { id: entityId },
        data: { disputedIncidents }
      });
    }
  } catch (error) {
    console.error('Error updating entity metrics:', error);
  }
}

// POST /api/incidents/[id]/dispute - Dispute an incident
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to dispute incidents' },
        { status: 401 }
      );
    }

    console.log(`🔍 User ${user.id} disputing incident ${id}`);

    // Get the incident
    const incident = await prisma.incident.findUnique({
      where: { id }
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Check if user already disputed this incident
    // For now, we'll just increment

    // If disputes exceed confirmations, remove verified badge
    const newDisputes = incident.disputes + 1;
    const shouldRemoveBadge = newDisputes > incident.confirmations && incident.verifiedBadge;

    // Increment disputes
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        disputes: { increment: 1 },
        verifiedBadge: shouldRemoveBadge ? false : incident.verifiedBadge
      }
    });

    console.log(`✅ Incident ${id} disputed. Total: ${updated.disputes}`);

    // Update entity metrics if incident is approved
    if (incident.status === 'APPROVED') {
      await updateEntityMetrics(incident.entityType, incident.entityId);
    }

    // Calculate display status for response
    const displayStatus = updated.verifiedBadge ? 'VERIFIED' : 
                         updated.proofUrls?.length > 0 ? 'PROOF_SUBMITTED' :
                         updated.disputes > updated.confirmations ? 'DISPUTED' : 'UNVERIFIED';

    return NextResponse.json({
      success: true,
      message: 'Incident disputed',
      confirmations: updated.confirmations,
      disputes: updated.disputes,
      verifiedBadge: updated.verifiedBadge,
      displayStatus,
      badgeRemoved: shouldRemoveBadge
    });

  } catch (error) {
    console.error('Error disputing incident:', error);
    return NextResponse.json(
      { error: 'Failed to dispute incident' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}