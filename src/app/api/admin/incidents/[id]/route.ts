import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "development-secret-key-12345"
    ) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    return user;
  } catch {
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

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metrics = {
      totalIncidents: incidents.length,
      incidentsLast7Days: incidents.filter(i => i.createdAt >= sevenDaysAgo).length,
      incidentsLast30Days: incidents.filter(i => i.createdAt >= thirtyDaysAgo).length,
      withdrawalReports: incidents.filter(i => i.incidentType.includes('WITHDRAWAL')).length,
      withdrawalDelays: incidents.filter(i => i.incidentType === 'WITHDRAWAL_DELAY').length,
      withdrawalConfirmed: incidents.filter(i => i.incidentType === 'WITHDRAWAL_PAID').length,
      withdrawalRejected: incidents.filter(i => i.incidentType === 'WITHDRAWAL_REJECTED').length,
      executionComplaints: incidents.filter(i => 
        ['SLIPPAGE_ISSUES', 'SPREAD_SPIKE', 'EXECUTION_DELAY', 'TRADE_MANIPULATION_SUSPECTED'].includes(i.incidentType)
      ).length,
      platformIssues: incidents.filter(i =>
        ['PLATFORM_FREEZE', 'SERVER_DOWN', 'LOGIN_ISSUES', 'ORDER_EXECUTION_FAILURE'].includes(i.incidentType)
      ).length,
      resolvedIncidents: incidents.filter(i => i.verifiedBadge).length,
      disputedIncidents: incidents.filter(i => i.disputes > i.confirmations).length
    };

    if (entityType === 'broker') {
      await prisma.broker.update({
        where: { id: entityId },
        data: metrics
      });
    } else {
      await prisma.propFirm.update({
        where: { id: entityId },
        data: metrics
      });
    }
    
    console.log(`✅ Updated ${entityType} ${entityId} metrics after moderation`);
  } catch (error) {
    console.error('Error updating entity metrics:', error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, note } = await request.json();

    let updateData: any = {};
    
    switch(action) {
      case 'approve':
        updateData = { 
          status: 'APPROVED', 
          moderatedBy: user.id, 
          moderatedAt: new Date(), 
          moderationNote: note 
        };
        break;
      case 'reject':
        updateData = { 
          status: 'REJECTED', 
          moderatedBy: user.id, 
          moderatedAt: new Date(), 
          moderationNote: note 
        };
        break;
      case 'verify':
        updateData = { 
          verifiedBadge: true, 
          status: 'APPROVED', 
          moderatedBy: user.id, 
          moderatedAt: new Date() 
        };
        break;
      case 'flag':
        updateData = { 
          status: 'FLAGGED', 
          moderatedBy: user.id, 
          moderatedAt: new Date(), 
          moderationNote: note 
        };
        break;
      case 'resolve':
        updateData = {
          resolutionStatus: 'RESOLVED',
          moderatedBy: user.id,
          moderatedAt: new Date(),
          moderationNote: note
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Update entity metrics after approval
    if (action === 'approve' || action === 'verify') {
      await updateEntityMetrics(incident.entityType, incident.entityId);
    }

    // Calculate display status for response
    const displayStatus = incident.verifiedBadge ? 'VERIFIED' : 
                         incident.proofUrls?.length > 0 ? 'PROOF_SUBMITTED' :
                         incident.disputes > incident.confirmations ? 'DISPUTED' : 'UNVERIFIED';

    return NextResponse.json({ 
      success: true, 
      incident: {
        ...incident,
        displayStatus
      },
      message: `Incident ${action}d successfully` 
    });

  } catch (error) {
    console.error('Error moderating incident:', error);
    return NextResponse.json({ error: 'Failed to moderate incident' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get incident before deletion to update metrics
    const incident = await prisma.incident.findUnique({
      where: { id }
    });

    await prisma.incident.delete({
      where: { id }
    });

    // Update entity metrics after deletion
    if (incident) {
      await updateEntityMetrics(incident.entityType, incident.entityId);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Incident deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json({ error: 'Failed to delete incident' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}