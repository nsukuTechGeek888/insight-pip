import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function GET() {
  try {
    // Group by category
    const grouped = Object.entries(INCIDENT_TYPE_DEFINITIONS).reduce((acc, [key, value]) => {
      if (!acc[value.category]) {
        acc[value.category] = [];
      }
      acc[value.category].push({
        id: key,
        ...value
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Sort each category by severity
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => b.severity - a.severity);
    });

    return NextResponse.json({
      success: true,
      types: INCIDENT_TYPE_DEFINITIONS,
      grouped,
      categories: Object.keys(grouped)
    });

  } catch (error) {
    console.error('Error fetching incident types:', error);
    return NextResponse.json({ error: 'Failed to fetch incident types' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}