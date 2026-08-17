// app/api/admin/prop-firms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string; role: string };
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch { 
    return null; 
  }
}

// GET /api/admin/prop-firms/[id] - Get single prop firm
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const firm = await prisma.propFirm.findUnique({
      where: { id: parseInt(id) },
      include: {
        programs: true,
        promotions: true,
      },
    });

    if (!firm) {
      return NextResponse.json({ error: 'Prop firm not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, firm });
  } catch (error) {
    console.error('Error fetching prop firm:', error);
    return NextResponse.json({ error: 'Failed to fetch prop firm' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/prop-firms/[id] - Update prop firm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const firmId = parseInt(id);
    
    console.log('🔍 [ADMIN PUT] Updating prop firm ID:', firmId);
    
    const body = await request.json();
    console.log('📦 [ADMIN PUT] Received fields:', Object.keys(body));
    
    // Extract programs and promotions
    const { programs, promotions, ...updateData } = body;
    
    // Valid fields for PropFirm model
    const validFields = new Set([
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
    
    // Build clean data - only include valid fields with non-empty values
    const cleanData: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      // Skip if key is not valid
      if (!validFields.has(key)) {
        console.log(`⏭️ [ADMIN PUT] Skipping invalid field: ${key}`);
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
    
    // Add slug if name is provided
    if (cleanData.name && !updateData.slug) {
      cleanData.slug = cleanData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    console.log('🧹 [ADMIN PUT] Cleaned fields:', Object.keys(cleanData));
    
    if (Object.keys(cleanData).length === 0) {
      console.log('❌ [ADMIN PUT] No valid fields to update');
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Update the prop firm
    let updatedFirm;
    try {
      updatedFirm = await prisma.propFirm.update({
        where: { id: firmId },
        data: cleanData,
      });
      console.log('✅ [ADMIN PUT] Firm updated successfully');
    } catch (dbError: any) {
      console.error('❌ [ADMIN PUT] Database error:', dbError);
      console.error('❌ [ADMIN PUT] Error message:', dbError.message);
      return NextResponse.json({
        error: 'Database error',
        details: dbError.message
      }, { status: 500 });
    }
    
    // Update programs if provided
    if (programs && programs.length > 0) {
      try {
        await prisma.propFirmProgram.deleteMany({
          where: { propFirmId: firmId },
        });
        
        for (const program of programs) {
          await prisma.propFirmProgram.create({
            data: {
              name: program.name || 'Program',
              type: program.type || 'Standard',
              description: program.description || '',
              timeLimit: program.timeLimit || {},
              rules: program.rules || {},
              accountOptions: program.accountOptions || [],
              propFirmId: firmId,
            },
          });
        }
        console.log(`✅ [ADMIN PUT] ${programs.length} programs updated`);
      } catch (progError: any) {
        console.error('❌ [ADMIN PUT] Error updating programs:', progError);
      }
    }
    
    // Update promotions if provided
    if (promotions && promotions.length > 0) {
      try {
        await prisma.propFirmPromotion.deleteMany({
          where: { propFirmId: firmId },
        });
        
        for (const promo of promotions) {
          await prisma.propFirmPromotion.create({
            data: {
              name: promo.name || 'Promotion',
              description: promo.description || '',
              discount: promo.discount || null,
              code: promo.code || '',
              validUntil: promo.validUntil ? new Date(promo.validUntil) : null,
              propFirmId: firmId,
            },
          });
        }
        console.log(`✅ [ADMIN PUT] ${promotions.length} promotions updated`);
      } catch (promoError: any) {
        console.error('❌ [ADMIN PUT] Error updating promotions:', promoError);
      }
    }
    
    const result = await prisma.propFirm.findUnique({
      where: { id: firmId },
      include: {
        programs: true,
        promotions: true,
      },
    });
    
    return NextResponse.json({ success: true, firm: result });
    
  } catch (error: any) {
    console.error('❌ [ADMIN PUT] Error:', error);
    console.error('❌ [ADMIN PUT] Message:', error.message);
    console.error('❌ [ADMIN PUT] Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to update prop firm',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/prop-firms/[id] - Delete prop firm
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    await prisma.propFirmProgram.deleteMany({ where: { propFirmId: parseInt(id) } });
    await prisma.propFirmPromotion.deleteMany({ where: { propFirmId: parseInt(id) } });
    
    await prisma.propFirm.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prop firm:', error);
    return NextResponse.json({ error: 'Failed to delete prop firm' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}