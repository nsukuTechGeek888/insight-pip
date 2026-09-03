import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { updateBrokerMetrics, updatePropFirmMetrics } from '@/lib/incident-metrics';

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
      select: { id: true, email: true, name: true, role: true }
    });
    
    return user;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return null;
  }
}

// Validation schema for incidents - UPDATED: min description length 3 instead of 20
const incidentSchema = z.object({
  entityType: z.enum(['broker', 'propFirm']),
  entityId: z.number(),
  incidentType: z.enum([
    'WITHDRAWAL_PAID',
    'WITHDRAWAL_DELAY',
    'WITHDRAWAL_REJECTED',
    'SLIPPAGE_ISSUES',
    'SPREAD_SPIKE',
    'EXECUTION_DELAY',
    'TRADE_MANIPULATION_SUSPECTED',
    'PLATFORM_FREEZE',
    'SERVER_DOWN',
    'LOGIN_ISSUES',
    'ORDER_EXECUTION_FAILURE',
    'ACCOUNT_SUSPENDED',
    'ACCOUNT_BANNED',
    'WITHDRAWAL_DENIED_AFTER_PROFIT',
    'RULE_VIOLATION_DISPUTE',
    'SUSPICIOUS_BROKER_ACTIVITY',
    'SCAM_WARNING',
    'OTHER'
  ]),
  title: z.string().min(3).max(100),
  description: z.string().min(3).max(2000), // ✅ CHANGED: min 3 instead of 20
  incidentDate: z.string().datetime(),
  
  // Optional fields
  withdrawalAmount: z.number().positive().optional(),
  withdrawalMethod: z.enum(['Bank Transfer', 'Crypto', 'Card', 'Skrill', 'Neteller', 'Other']).optional(),
  
  // User context
  userExperience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']).optional(),
  userTradingStyle: z.enum(['SCALPER', 'DAY_TRADER', 'SWING_TRADER', 'EA_TRADER', 'NEWS_TRADER']).optional(),
});

// Helper function to check for automated alerts
async function checkForAlerts(entityType: string, entityId: number, incidentType: string) {
  const timeWindow = 48; // hours
  const threshold = 5;
  
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - timeWindow);
  
  const recentCount = await prisma.incident.count({
    where: {
      entityType,
      entityId,
      incidentType,
      createdAt: { gte: cutoffTime },
      status: 'APPROVED'
    }
  });
  
  if (recentCount >= threshold) {
    // Get the entity
    const entity = entityType === 'broker' 
      ? await prisma.broker.findUnique({ where: { id: entityId } })
      : await prisma.propFirm.findUnique({ where: { id: entityId } });
      
    if (entity) {
      // Update incidentTrends JSON
      const trends = entity.incidentTrends ? JSON.parse(entity.incidentTrends as string) : { alerts: [] };
      trends.alerts = trends.alerts || [];
      
      // Check if this alert already exists and is active
      const existingAlert = trends.alerts.find((a: any) => 
        a.type === incidentType && 
        new Date(a.triggeredAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      if (!existingAlert) {
        trends.alerts.push({
          type: incidentType,
          count: recentCount,
          timeWindow,
          triggeredAt: new Date().toISOString(),
          message: `${recentCount} ${incidentType.toLowerCase().replace(/_/g, ' ')} reports in last ${timeWindow}h`,
          severity: recentCount >= 10 ? 'critical' : recentCount >= 7 ? 'warning' : 'info'
        });
        
        if (entityType === 'broker') {
          await prisma.broker.update({
            where: { id: entityId },
            data: { incidentTrends: JSON.stringify(trends) }
          });
        } else {
          await prisma.propFirm.update({
            where: { id: entityId },
            data: { incidentTrends: JSON.stringify(trends) }
          });
        }
        
        console.log(`🚨 ALERT CREATED: ${recentCount} ${incidentType} incidents for ${entityType} ${entityId}`);
      }
    }
  }
}

// Incident type definitions with display names and categories
const INCIDENT_TYPE_DEFINITIONS = {
  WITHDRAWAL_PAID: { 
    displayName: 'Withdrawal Paid', 
    category: 'withdrawal',
    severity: 1,
    icon: '💰',
    description: 'Successful withdrawal processed'
  },
  WITHDRAWAL_DELAY: { 
    displayName: 'Withdrawal Delay', 
    category: 'withdrawal',
    severity: 3,
    icon: '⏳',
    description: 'Withdrawal taking longer than stated policy'
  },
  WITHDRAWAL_REJECTED: { 
    displayName: 'Withdrawal Rejected', 
    category: 'withdrawal',
    severity: 4,
    icon: '❌',
    description: 'Withdrawal request rejected without valid reason'
  },
  SLIPPAGE_ISSUES: { 
    displayName: 'Slippage Issues', 
    category: 'execution',
    severity: 3,
    icon: '📉',
    description: 'Excessive slippage during order execution'
  },
  SPREAD_SPIKE: { 
    displayName: 'Spread Spike', 
    category: 'execution',
    severity: 2,
    icon: '📈',
    description: 'Unusual spread widening during trading'
  },
  EXECUTION_DELAY: { 
    displayName: 'Execution Delay', 
    category: 'execution',
    severity: 3,
    icon: '⏱️',
    description: 'Orders taking too long to execute'
  },
  TRADE_MANIPULATION_SUSPECTED: { 
    displayName: 'Trade Manipulation', 
    category: 'execution',
    severity: 5,
    icon: '🎭',
    description: 'Suspicious trade manipulation suspected'
  },
  PLATFORM_FREEZE: { 
    displayName: 'Platform Freeze', 
    category: 'platform',
    severity: 4,
    icon: '❄️',
    description: 'Platform freezing during trading'
  },
  SERVER_DOWN: { 
    displayName: 'Server Down', 
    category: 'platform',
    severity: 5,
    icon: '⚠️',
    description: 'Server unavailable during trading hours'
  },
  LOGIN_ISSUES: { 
    displayName: 'Login Issues', 
    category: 'platform',
    severity: 3,
    icon: '🔑',
    description: 'Unable to log into trading account'
  },
  ORDER_EXECUTION_FAILURE: { 
    displayName: 'Order Execution Failure', 
    category: 'platform',
    severity: 4,
    icon: '❌',
    description: 'Orders failing to execute'
  },
  ACCOUNT_SUSPENDED: { 
    displayName: 'Account Suspended', 
    category: 'account',
    severity: 4,
    icon: '🔒',
    description: 'Account suspended without explanation'
  },
  ACCOUNT_BANNED: { 
    displayName: 'Account Banned', 
    category: 'account',
    severity: 5,
    icon: '🚫',
    description: 'Account permanently banned'
  },
  WITHDRAWAL_DENIED_AFTER_PROFIT: { 
    displayName: 'Withdrawal Denied After Profit', 
    category: 'withdrawal',
    severity: 5,
    icon: '💸',
    description: 'Withdrawal denied after profitable trading'
  },
  RULE_VIOLATION_DISPUTE: { 
    displayName: 'Rule Violation Dispute', 
    category: 'account',
    severity: 3,
    icon: '⚖️',
    description: 'Disputing alleged rule violation'
  },
  SUSPICIOUS_BROKER_ACTIVITY: { 
    displayName: 'Suspicious Activity', 
    category: 'compliance',
    severity: 4,
    icon: '🕵️',
    description: 'Suspicious broker behavior detected'
  },
  SCAM_WARNING: { 
    displayName: 'Scam Warning', 
    category: 'compliance',
    severity: 5,
    icon: '🚨',
    description: 'Potential scam activity'
  },
  OTHER: { 
    displayName: 'Other Issue', 
    category: 'other',
    severity: 1,
    icon: '📌',
    description: 'Other trading-related issue'
  }
};

// POST /api/incidents - Create a new incident report
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to report an incident' },
        { status: 401 }
      );
    }

    // ===== RATE LIMITING =====
    const userIncidentsToday = await prisma.incident.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    if (userIncidentsToday >= 3) {
      return NextResponse.json(
        { error: 'Daily incident limit reached (max 3 per day)' },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log('📥 Incident report received:', body);

    // Validate request body
    const validatedData = incidentSchema.parse(body);

    // Verify that the entity exists
    if (validatedData.entityType === 'broker') {
      const broker = await prisma.broker.findUnique({
        where: { id: validatedData.entityId }
      });
      if (!broker) {
        return NextResponse.json(
          { error: 'Broker not found' },
          { status: 404 }
        );
      }
    } else {
      const propFirm = await prisma.propFirm.findUnique({
        where: { id: validatedData.entityId }
      });
      if (!propFirm) {
        return NextResponse.json(
          { error: 'Prop firm not found' },
          { status: 404 }
        );
      }
    }

    // ===== DUPLICATE CHECK =====
    const existingDuplicate = await prisma.incident.findFirst({
      where: {
        userId: user.id,
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        incidentType: validatedData.incidentType,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingDuplicate) {
      return NextResponse.json(
        { error: 'You have already reported this incident type for this entity in the last 24 hours' },
        { status: 400 }
      );
    }

    // Create the incident report
    const incident = await prisma.incident.create({
      data: {
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        incidentType: validatedData.incidentType,
        title: validatedData.title,
        description: validatedData.description,
        incidentDate: new Date(validatedData.incidentDate),
        
        // Optional fields
        withdrawalAmount: validatedData.withdrawalAmount,
        withdrawalMethod: validatedData.withdrawalMethod,
        
        // User context
        userId: user.id,
        userExperience: validatedData.userExperience,
        userTradingStyle: validatedData.userTradingStyle,
        
        // Default values
        proofUrls: [],
        proofVerified: false,
        confirmations: 0,
        disputes: 0,
        verifiedBadge: false,
        status: 'PENDING', // Requires admin approval
        resolutionStatus: 'PENDING'
      },
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

    console.log(`✅ Incident reported: ${incident.id}`);

    // ===== CHECK FOR AUTOMATED ALERTS =====
    await checkForAlerts(validatedData.entityType, validatedData.entityId, validatedData.incidentType);

    // Calculate display status for frontend
    const displayStatus = incident.verifiedBadge ? 'VERIFIED' : 
                         incident.proofUrls?.length > 0 ? 'PROOF_SUBMITTED' :
                         incident.disputes > incident.confirmations ? 'DISPUTED' : 'UNVERIFIED';

    // Return response
    return NextResponse.json({
      success: true,
      message: 'Incident reported successfully. It will be reviewed by our team.',
      incident: {
        id: incident.id,
        title: incident.title,
        type: incident.incidentType,
        status: incident.status,
        displayStatus,
        proofProvided: incident.proofUrls?.length > 0,
        createdAt: incident.createdAt,
        remainingReports: 2 - userIncidentsToday, // 3 max, they just used 1
        dailyLimit: 3
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('❌ Error reporting incident:', error);
    return NextResponse.json(
      { error: 'Failed to report incident' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/incidents - List incidents with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const incidentType = searchParams.get('incidentType');
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const days = parseInt(searchParams.get('days') || '30'); // Default to last 30 days

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // Date filter
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      where.createdAt = { gte: cutoffDate };
    }
    
    // Only add status filter if not 'ALL'
    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    }
    
    if (entityType && entityId) {
      where.entityType = entityType;
      where.entityId = parseInt(entityId);
    }
    
    if (incidentType) {
      where.incidentType = incidentType;
    }

    console.log('📡 Fetching incidents with where:', where);

    // Get incidents with pagination
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        }
      }),
      prisma.incident.count({ where })
    ]);

    console.log(`✅ Found ${incidents.length} incidents`);

    // Calculate display status for each incident
    const incidentsWithStatus = incidents.map(incident => ({
      ...incident,
      displayStatus: incident.verifiedBadge ? 'VERIFIED' : 
                     incident.proofUrls?.length > 0 ? 'PROOF_SUBMITTED' :
                     incident.disputes > incident.confirmations ? 'DISPUTED' : 'UNVERIFIED',
      proofProvided: incident.proofUrls?.length > 0,
      confirmVsDispute: incident.confirmations - incident.disputes,
      trustScore: incident.confirmations + incident.disputes > 0 
        ? Math.round((incident.confirmations / (incident.confirmations + incident.disputes)) * 100)
        : 0
    }));

    // Get alerts for this entity if specified
    let alerts: any[] = [];
    if (entityType && entityId) {
      const entity = entityType === 'broker'
        ? await prisma.broker.findUnique({ where: { id: parseInt(entityId) } })
        : await prisma.propFirm.findUnique({ where: { id: parseInt(entityId) } });
      
      if (entity && entity.incidentTrends) {
        const trends = JSON.parse(entity.incidentTrends as string);
        alerts = trends.alerts || [];
      }
    }

    return NextResponse.json({
      success: true,
      incidents: incidentsWithStatus,
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        entityType,
        entityId,
        incidentType,
        status: statusParam,
        days
      }
    });

  } catch (error) {
    console.error('❌ Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/incidents/types - Get incident type definitions
export { INCIDENT_TYPE_DEFINITIONS };