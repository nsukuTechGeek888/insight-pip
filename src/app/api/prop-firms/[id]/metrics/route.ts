import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propFirmId = parseInt(id);
    
    if (isNaN(propFirmId)) {
      return NextResponse.json(
        { error: 'Invalid prop firm ID' },
        { status: 400 }
      );
    }

    console.log(`📊 Manually updating metrics for prop firm ${propFirmId}`);
    
    // Get all approved incidents for this prop firm
    const incidents = await prisma.incident.findMany({
      where: {
        entityType: 'propFirm',
        entityId: propFirmId,
        status: 'APPROVED'
      }
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate metrics
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
      
      accountBansReported: incidents.filter(i => i.incidentType === 'ACCOUNT_BANNED').length,
      ruleViolationDisputes: incidents.filter(i => i.incidentType === 'RULE_VIOLATION_DISPUTE').length,
      
      resolvedIncidents: incidents.filter(i => i.verifiedBadge).length,
      disputedIncidents: incidents.filter(i => i.disputes > i.confirmations).length,
      
      lastIncidentAt: incidents.length > 0 ? incidents[0].createdAt : null
    };

    // Update prop firm
    await prisma.propFirm.update({
      where: { id: propFirmId },
      data: metrics
    });

    return NextResponse.json({
      success: true,
      message: 'Prop firm metrics updated successfully',
      metrics
    });

  } catch (error) {
    console.error('Error updating prop firm metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update prop firm metrics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}