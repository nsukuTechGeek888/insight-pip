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

// Helper to update entity metrics after confirmation changes
async function updateEntityMetrics(entityType: string, entityId: number) {
  try {
    const incidents = await prisma.incident.findMany({
      where: {
        entityType,
        entityId,
        status: 'APPROVED'
      }
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate resolution metrics based on verified badges
    const resolvedIncidents = incidents.filter(i => i.verifiedBadge).length;
    const disputedIncidents = incidents.filter(i => !i.verifiedBadge && i.disputes > i.confirmations).length;

    if (entityType === 'broker') {
      await prisma.broker.update({
        where: { id: entityId },
        data: {
          resolvedIncidents,
          disputedIncidents,
          totalIncidents: incidents.length,
          incidentsLast7Days: incidents.filter(i => i.createdAt >= sevenDaysAgo).length,
          incidentsLast30Days: incidents.filter(i => i.createdAt >= thirtyDaysAgo).length
        }
      });
    } else {
      await prisma.propFirm.update({
        where: { id: entityId },
        data: {
          resolvedIncidents,
          disputedIncidents,
          totalIncidents: incidents.length,
          incidentsLast7Days: incidents.filter(i => i.createdAt >= sevenDaysAgo).length,
          incidentsLast30Days: incidents.filter(i => i.createdAt >= thirtyDaysAgo).length
        }
      });
    }
    
    console.log(`✅ Updated ${entityType} ${entityId} metrics`);
  } catch (error) {
    console.error('Error updating entity metrics:', error);
  }
}

// POST /api/incidents/[id]/confirm - Confirm an incident
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to confirm incidents' },
        { status: 401 }
      );
    }

    console.log(`🔍 User ${user.id} confirming incident ${id}`);

    // Get the incident first to check current values
    const incident = await prisma.incident.findUnique({
      where: { id }
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Check if user already voted (you'd need a Vote model for this)
    // For now, we'll just increment

    // Auto-verify threshold (3 confirmations)
    const AUTO_VERIFY_THRESHOLD = 3;
    const newConfirmations = incident.confirmations + 1;
    const shouldVerify = newConfirmations >= AUTO_VERIFY_THRESHOLD && !incident.verifiedBadge;

    console.log(`📊 Incident ${id}: Current confirmations: ${incident.confirmations}, New: ${newConfirmations}, Should verify: ${shouldVerify}`);

    // Increment confirmations and update verified badge if needed
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        confirmations: { increment: 1 },
        verifiedBadge: shouldVerify ? true : incident.verifiedBadge
      }
    });

    console.log(`✅ Incident ${id} confirmed. Total: ${updated.confirmations}, Verified: ${updated.verifiedBadge}`);

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
      message: 'Incident confirmed',
      confirmations: updated.confirmations,
      disputes: updated.disputes,
      verifiedBadge: updated.verifiedBadge,
      displayStatus,
      autoVerified: shouldVerify
    });

  } catch (error) {
    console.error('Error confirming incident:', error);
    return NextResponse.json(
      { error: 'Failed to confirm incident' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}