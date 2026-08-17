// app/api/prop-firms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to safely parse JSON
function safeJSONParse(value: any) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Valid fields that exist in the PropFirm model
const VALID_FIELDS = new Set([
  'name', 'slug', 'status', 'description', 'shortDescription', 'logo',
  'founded', 'foundedMonth', 'headquarters', 'website', 'contactEmail',
  'contactPhone', 'type', 'category', 'regulated', 'regulation',
  'safetyScore', 'rating', 'reviewsCount', 'avgTrustScore',
  'recommendationRate', 'country', 'yearsInOperation', 'assets', 'promo',
  'maxAllocation', 'signupLink', 'payoutFrequency', 'payoutMethods',
  'minimumPayout', 'supportedCountries', 'prohibitedCountries',
  'hasEducation', 'educationResources', 'communityFeatures',
  'customerSupport', 'platforms', 'tradingInstruments', 'features',
  'leverageOptions', 'averageSpreads', 'commissions', 'platformFees',
  'minimumAge', 'newsTradingRestrictions', 'isRecommended',
  'corporateAddress', 'additionalOffice', 'legalName', 'companyNumber',
  'ceo', 'monthlySearches', 'monthlyTraffic', 'claimedPayouts',
  'tradersServed', 'countriesServed', 'payoutProcessingTime',
  'restrictedFeatures', 'warnings', 'accountCurrencies',
  'regulatoryWarnings', 'entityMapping', 'minTradeSize', 'maxTradeSize',
  'marginCall', 'stopOutLevel', 'orderExecution', 'tradingHours',
  'swapRates', 'commissionNotes', 'chartingTools', 'copyTradingAvailable',
  'socialTradingAvailable', 'vpsAvailable', 'apiAvailable',
  'economicCalendar', 'newsTrading', 'depositMethodsDetails',
  'withdrawalMethodsDetails', 'withdrawalProcessingTime',
  'depositProcessingTime', 'inactivityFee', 'accountClosurePolicy',
  'partnershipPrograms', 'ibProgramAvailable',
  'affiliateProgramAvailable', 'securityFeatures', 'accountVerification',
  'twoFactorAuth', 'socialMedia', 'pressReleases', 'previousHeadquarters',
  'migrationStatus', 'trustpilotRating', 'trustpilotReviews',
  'trustpilotUrl', 'positiveReviewThemes', 'negativeReviewThemes',
  'supportAgents', 'knownIssues', 'systemBugs', 'payoutDelaysReported',
  'slippageReported', 'hiddenRulesReported', 'retroactiveRuleChanges',
  'withdrawalDenials', 'publicWarnings', 'totalPayoutsPaid',
  'totalPayoutsCurrency', 'totalPayoutsVerified',
  'payoutVerificationSource', 'totalTradersServed', 'dailyTradeCount',
  'riskLevel', 'riskScore', 'riskFactors', 'recommendation', 'redFlags',
  'greenFlags', 'maxAccountSize', 'maxAccountSizeCurrency',
  'oneStepAvailable', 'oneStepProfitTarget', 'oneStepMaxDrawdown',
  'oneStepDailyDrawdown', 'oneStepMinDays', 'oneStepMaxLossPerTrade',
  'oneStepConsistency', 'twoStepAvailable', 'twoStepProfitTarget1',
  'twoStepProfitTarget2', 'twoStepMaxDrawdown', 'twoStepDailyDrawdown',
  'twoStepMinDays1', 'twoStepMinDays2', 'twoStepMaxLossPerTrade',
  'twoStepConsistency', 'instantFundingAvailable', 'ifMaxDrawdown',
  'ifDailyDrawdown', 'ifMinTradingDays', 'ifMaxLossPerTrade',
  'ifConsistencyRule', 'ifProfitSplit', 'ifRewardCycle', 'ifTimeLimit',
  'payLaterAvailable', 'payLaterInitialFee', 'payLaterActivationFee',
  'payLaterProfitTarget', 'payLaterMaxDrawdown', 'payLaterMaxLossPerTrade',
  'payLaterConsistency', 'payLaterMaxAccounts', 'payLaterCountryCap',
  'payLaterAccountSizes', 'newsTradingWindow', 'newsProfitCap',
  'profitCaps', 'shortTradeMinDuration', 'consistencyRule', 'scalingPlan',
  'scalingLevel1Months', 'scalingLevel1Payouts', 'scalingLevel1Boost',
  'scalingLevel1Split', 'scalingLevel1Drawdown', 'scalingLevel1Benefits',
  'scalingLevel2Months', 'scalingLevel2Payouts', 'scalingLevel2Boost',
  'scalingLevel2Split', 'scalingLevel2Drawdown',
  'scalingLevel2WeeklyPayouts', 'scalingLevel2Benefits',
  'scalingLevel3Months', 'scalingLevel3Payouts', 'scalingLevel3Boost',
  'scalingLevel3Split', 'scalingLevel3Drawdown',
  'scalingLevel3MonthlySalary', 'scalingLevel3FreeChallenge',
  'scalingLevel3Benefits', 'scalingLevel4Months', 'scalingLevel4Payouts',
  'scalingLevel4Boost', 'scalingLevel4Split', 'scalingLevel4Drawdown',
  'scalingLevel4MonthlySalary', 'scalingLevel4FreeChallenge',
  'scalingLevel4Benefits', 'scalingLevelMax', 'bogoAvailable',
  'bogoDiscount', 'bogoFreeAccounts', 'bogoFreeAccountTiming',
  'affiliateDiscountCode', 'affiliateDiscountPercent', 'discountCodes',
  'maxLeverage', 'goatGuard', 'years', 'tradingConditions',
  'customerCare', 'userFriendliness', 'payoutProcess', 'totalReviews',
  'totalIncidents', 'incidentsLast7Days', 'incidentsLast30Days',
  'withdrawalReports', 'withdrawalDelays', 'withdrawalConfirmed',
  'withdrawalRejected', 'executionComplaints', 'slippageReports',
  'platformIssues', 'serverDownReports', 'accountBansReported',
  'ruleViolationDisputes', 'resolvedIncidents', 'disputedIncidents',
  'lastIncidentAt', 'incidentTrends', 'lastReviewed', 'ceoBio',
  'leadershipTeam', 'registrationNumber', 'registrationCountry',
  'regulatoryBodies', 'expertRating', 'avgOverallRating',
  'avgTradingConditions', 'avgCustomerCare', 'avgUserFriendliness',
  'avgPayoutProcess', 'avgReliability', 'avgExecutionQuality',
  'forexPeaceArmyRating', 'otherReviewSites', 'warningDates',
  'monthlyTradingVolume', 'minAccountSize', 'minDeposit',
  'prohibitedStrategies', 'hedgingAllowed', 'martingaleAllowed',
  'copyTradingAllowed', 'copyTradingRules', 'eaTrading', 'hftAllowed',
  'weekendHolding', 'awards', 'highlight'
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📡 API Request for prop firm identifier:', id);
    
    const isNumeric = /^\d+$/.test(id);
    
    let propFirm;
    
    if (isNumeric) {
      const firmId = parseInt(id);
      console.log('🔍 Fetching by ID:', firmId);
      
      propFirm = await prisma.propFirm.findUnique({
        where: { id: firmId },
        include: {
          programs: true,
          promotions: true,
        }
      });
    } else {
      console.log('🔍 Fetching by slug:', id);
      
      propFirm = await prisma.propFirm.findUnique({
        where: { slug: id },
        include: {
          programs: true,
          promotions: true,
        }
      });
    }
    
    if (!propFirm) {
      console.log('❌ Prop firm not found:', id);
      return NextResponse.json(
        { success: false, error: 'Prop firm not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Found prop firm:', propFirm.name);
    
    return NextResponse.json({
      success: true,
      data: propFirm
    });
    
  } catch (error) {
    console.error('Error fetching prop firm:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prop firm' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const firmId = parseInt(id);
    
    console.log('🔍 [PUBLIC PUT] Updating prop firm ID:', firmId);
    console.log('📦 [PUBLIC PUT] Received fields:', Object.keys(body));
    
    // Clean the data - only include valid fields with non-empty values
    const cleanData: any = {};
    for (const [key, value] of Object.entries(body)) {
      // Skip if key is not valid
      if (!VALID_FIELDS.has(key)) {
        console.log(`⏭️ [PUBLIC PUT] Skipping invalid field: ${key}`);
        continue;
      }
      
      // Skip null, undefined, empty string
      if (value === null || value === undefined || value === '') continue;
      
      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) continue;
      
      // Skip empty objects
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) continue;
      
      // Convert string numbers to actual numbers
      if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          cleanData[key] = num;
          continue;
        }
      }
      
      cleanData[key] = value;
    }
    
    if (Object.keys(cleanData).length === 0) {
      console.log('❌ [PUBLIC PUT] No valid fields to update');
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    console.log('🧹 [PUBLIC PUT] Cleaned fields:', Object.keys(cleanData));
    
    const propFirm = await prisma.propFirm.update({
      where: { id: firmId },
      data: cleanData,
    });
    
    console.log('✅ [PUBLIC PUT] Prop firm updated:', propFirm.name);
    
    return NextResponse.json({ success: true, data: propFirm });
  } catch (error: any) {
    console.error('❌ [PUBLIC PUT] Error:', error);
    console.error('❌ [PUBLIC PUT] Message:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update prop firm' },
      { status: 500 }
    );
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
    
    await prisma.propFirm.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true, message: 'Prop firm deleted' });
  } catch (error) {
    console.error('Error deleting prop firm:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prop firm' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}