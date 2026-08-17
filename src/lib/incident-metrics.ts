import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateBrokerMetrics(brokerId: number) {
  try {
    // Get all approved incidents for this broker
    const incidents = await prisma.incident.findMany({
      where: {
        entityType: 'broker',
        entityId: brokerId,
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
      accountSuspensions: incidents.filter(i => i.incidentType === 'ACCOUNT_SUSPENDED').length,
      
      resolvedIncidents: incidents.filter(i => i.verifiedBadge).length,
      disputedIncidents: incidents.filter(i => i.disputes > i.confirmations).length,
      
      lastIncidentAt: incidents.length > 0 ? incidents[0].createdAt : null
    };

    // Update broker
    await prisma.broker.update({
      where: { id: brokerId },
      data: metrics
    });

    console.log(`✅ Updated broker ${brokerId} metrics:`, metrics);
    return metrics;

  } catch (error) {
    console.error('Error updating broker metrics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function updatePropFirmMetrics(propFirmId: number) {
  try {
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

    const metrics = {
      totalIncidents: incidents.length,
      incidentsLast7Days: incidents.filter(i => i.createdAt >= sevenDaysAgo).length,
      incidentsLast30Days: incidents.filter(i => i.createdAt >= thirtyDaysAgo).length,
      
      withdrawalReports: incidents.filter(i => i.incidentType.includes('WITHDRAWAL')).length,
      withdrawalDelays: incidents.filter(i => i.incidentType === 'WITHDRAWAL_DELAY').length,
      
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

    await prisma.propFirm.update({
      where: { id: propFirmId },
      data: metrics
    });

    console.log(`✅ Updated prop firm ${propFirmId} metrics:`, metrics);
    return metrics;

  } catch (error) {
    console.error('Error updating prop firm metrics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}