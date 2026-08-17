import { z } from 'zod';

export const incidentTypeEnum = z.enum([
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
]);

export const withdrawalMethodEnum = z.enum([
  'Bank Transfer',
  'Crypto',
  'Card',
  'Skrill',
  'Neteller',
  'Other'
]).optional();

export const incidentSchema = z.object({
  entityType: z.enum(['broker', 'propFirm']),
  entityId: z.number(),
  incidentType: incidentTypeEnum,
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  incidentDate: z.string().datetime(),
  
  // Optional fields
  withdrawalAmount: z.number().positive().optional(),
  withdrawalMethod: withdrawalMethodEnum,
  
  // User context (will be added from session)
  userExperience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']).optional(),
  userTradingStyle: z.enum(['SCALPER', 'DAY_TRADER', 'SWING_TRADER', 'EA_TRADER', 'NEWS_TRADER']).optional(),
});

export type IncidentInput = z.infer<typeof incidentSchema>;