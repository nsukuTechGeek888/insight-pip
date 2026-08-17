// app/api/admin/prop-firms/import/route.ts
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

// Helper to clean object - remove undefined and null values
function cleanData(data: any): any {
  const result: any = {};
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      result[key] = data[key];
    }
  }
  return result;
}

// Fields that exist in the PropFirm model
const VALID_FIELDS = [
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
  'maxLeverage', 'years', 'tradingConditions', 'customerCare',
  'userFriendliness', 'payoutProcess', 'totalReviews', 'totalIncidents',
  'incidentsLast7Days', 'incidentsLast30Days', 'withdrawalReports',
  'withdrawalDelays', 'withdrawalConfirmed', 'withdrawalRejected',
  'executionComplaints', 'slippageReports', 'platformIssues',
  'serverDownReports', 'accountBansReported', 'ruleViolationDisputes',
  'resolvedIncidents', 'disputedIncidents', 'lastIncidentAt',
  'incidentTrends', 'lastReviewed', 'ceoBio', 'leadershipTeam',
  'registrationNumber', 'registrationCountry', 'regulatoryBodies',
  'expertRating', 'avgOverallRating', 'avgTradingConditions',
  'avgCustomerCare', 'avgUserFriendliness', 'avgPayoutProcess',
  'avgReliability', 'avgExecutionQuality', 'forexPeaceArmyRating',
  'otherReviewSites', 'warningDates', 'monthlyTradingVolume',
  'minAccountSize', 'minDeposit', 'ifDailyDrawdown', 'ifTimeLimit',
  'prohibitedStrategies', 'hedgingAllowed', 'martingaleAllowed',
  'copyTradingAllowed', 'copyTradingRules', 'eaTrading', 'hftAllowed',
  'weekendHolding', 'maxDailyProfit', 'firstPayoutSplit',
  'secondPayoutSplit', 'thirdPayoutSplit', 'maxWithdrawableProfit',
  'goatGuard', 'activationFee', 'awards', 'highlight'
];

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const firms = Array.isArray(body) ? body : [body];
    
    const results = [];
    const errors = [];

    for (const firmData of firms) {
      try {
        const slug = firmData.slug || firmData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Build clean data object with ONLY valid fields
        const cleanDataObj: any = {
          name: firmData.name,
          slug: slug,
        };
        
        // Only include fields that are in VALID_FIELDS and have non-null/undefined values
        for (const field of VALID_FIELDS) {
          if (firmData[field] !== undefined && firmData[field] !== null) {
            cleanDataObj[field] = firmData[field];
          }
        }
        
        // Handle arrays properly
        if (firmData.assets && firmData.assets.length > 0) {
          cleanDataObj.assets = firmData.assets;
        }
        if (firmData.platforms && firmData.platforms.length > 0) {
          cleanDataObj.platforms = firmData.platforms;
        }
        if (firmData.features && firmData.features.length > 0) {
          cleanDataObj.features = firmData.features;
        }
        if (firmData.tradingInstruments && firmData.tradingInstruments.length > 0) {
          cleanDataObj.tradingInstruments = firmData.tradingInstruments;
        }
        if (firmData.payoutMethods && firmData.payoutMethods.length > 0) {
          cleanDataObj.payoutMethods = firmData.payoutMethods;
        }
        if (firmData.supportedCountries && firmData.supportedCountries.length > 0) {
          cleanDataObj.supportedCountries = firmData.supportedCountries;
        }
        if (firmData.prohibitedCountries && firmData.prohibitedCountries.length > 0) {
          cleanDataObj.prohibitedCountries = firmData.prohibitedCountries;
        }
        if (firmData.customerSupport && firmData.customerSupport.length > 0) {
          cleanDataObj.customerSupport = firmData.customerSupport;
        }
        if (firmData.educationResources && firmData.educationResources.length > 0) {
          cleanDataObj.educationResources = firmData.educationResources;
        }
        if (firmData.communityFeatures && firmData.communityFeatures.length > 0) {
          cleanDataObj.communityFeatures = firmData.communityFeatures;
        }
        if (firmData.chartingTools && firmData.chartingTools.length > 0) {
          cleanDataObj.chartingTools = firmData.chartingTools;
        }
        if (firmData.securityFeatures && firmData.securityFeatures.length > 0) {
          cleanDataObj.securityFeatures = firmData.securityFeatures;
        }
        if (firmData.positiveReviewThemes && firmData.positiveReviewThemes.length > 0) {
          cleanDataObj.positiveReviewThemes = firmData.positiveReviewThemes;
        }
        if (firmData.negativeReviewThemes && firmData.negativeReviewThemes.length > 0) {
          cleanDataObj.negativeReviewThemes = firmData.negativeReviewThemes;
        }
        if (firmData.supportAgents && firmData.supportAgents.length > 0) {
          cleanDataObj.supportAgents = firmData.supportAgents;
        }
        if (firmData.systemBugs && firmData.systemBugs.length > 0) {
          cleanDataObj.systemBugs = firmData.systemBugs;
        }
        if (firmData.riskFactors && firmData.riskFactors.length > 0) {
          cleanDataObj.riskFactors = firmData.riskFactors;
        }
        if (firmData.redFlags && firmData.redFlags.length > 0) {
          cleanDataObj.redFlags = firmData.redFlags;
        }
        if (firmData.greenFlags && firmData.greenFlags.length > 0) {
          cleanDataObj.greenFlags = firmData.greenFlags;
        }
        if (firmData.payLaterAccountSizes && firmData.payLaterAccountSizes.length > 0) {
          cleanDataObj.payLaterAccountSizes = firmData.payLaterAccountSizes;
        }
        if (firmData.accountCurrencies && firmData.accountCurrencies.length > 0) {
          cleanDataObj.accountCurrencies = firmData.accountCurrencies;
        }
        if (firmData.regulatoryWarnings && firmData.regulatoryWarnings.length > 0) {
          cleanDataObj.regulatoryWarnings = firmData.regulatoryWarnings;
        }
        if (firmData.regulatoryBodies && firmData.regulatoryBodies.length > 0) {
          cleanDataObj.regulatoryBodies = firmData.regulatoryBodies;
        }
        if (firmData.partnershipPrograms && firmData.partnershipPrograms.length > 0) {
          cleanDataObj.partnershipPrograms = firmData.partnershipPrograms;
        }
        if (firmData.restrictedFeatures && firmData.restrictedFeatures.length > 0) {
          cleanDataObj.restrictedFeatures = firmData.restrictedFeatures;
        }
        if (firmData.warnings && firmData.warnings.length > 0) {
          cleanDataObj.warnings = firmData.warnings;
        }
        if (firmData.scalingLevel1Benefits && firmData.scalingLevel1Benefits.length > 0) {
          cleanDataObj.scalingLevel1Benefits = firmData.scalingLevel1Benefits;
        }
        if (firmData.scalingLevel2Benefits && firmData.scalingLevel2Benefits.length > 0) {
          cleanDataObj.scalingLevel2Benefits = firmData.scalingLevel2Benefits;
        }
        if (firmData.scalingLevel3Benefits && firmData.scalingLevel3Benefits.length > 0) {
          cleanDataObj.scalingLevel3Benefits = firmData.scalingLevel3Benefits;
        }
        if (firmData.scalingLevel4Benefits && firmData.scalingLevel4Benefits.length > 0) {
          cleanDataObj.scalingLevel4Benefits = firmData.scalingLevel4Benefits;
        }
        if (firmData.prohibitedStrategies && firmData.prohibitedStrategies.length > 0) {
          cleanDataObj.prohibitedStrategies = firmData.prohibitedStrategies;
        }
        if (firmData.awards && firmData.awards.length > 0) {
          cleanDataObj.awards = firmData.awards;
        }

        // Handle JSON fields
        if (firmData.leverageOptions && Object.keys(firmData.leverageOptions).length > 0) {
          cleanDataObj.leverageOptions = firmData.leverageOptions;
        }
        if (firmData.averageSpreads && Object.keys(firmData.averageSpreads).length > 0) {
          cleanDataObj.averageSpreads = firmData.averageSpreads;
        }
        if (firmData.commissions && Object.keys(firmData.commissions).length > 0) {
          cleanDataObj.commissions = firmData.commissions;
        }
        if (firmData.entityMapping && Object.keys(firmData.entityMapping).length > 0) {
          cleanDataObj.entityMapping = firmData.entityMapping;
        }
        if (firmData.profitCaps && Object.keys(firmData.profitCaps).length > 0) {
          cleanDataObj.profitCaps = firmData.profitCaps;
        }
        if (firmData.scalingPlan && Object.keys(firmData.scalingPlan).length > 0) {
          cleanDataObj.scalingPlan = firmData.scalingPlan;
        }
        if (firmData.socialMedia && Object.keys(firmData.socialMedia).length > 0) {
          cleanDataObj.socialMedia = firmData.socialMedia;
        }
        if (firmData.depositMethodsDetails && Object.keys(firmData.depositMethodsDetails).length > 0) {
          cleanDataObj.depositMethodsDetails = firmData.depositMethodsDetails;
        }
        if (firmData.withdrawalMethodsDetails && Object.keys(firmData.withdrawalMethodsDetails).length > 0) {
          cleanDataObj.withdrawalMethodsDetails = firmData.withdrawalMethodsDetails;
        }
        if (firmData.publicWarnings && firmData.publicWarnings.length > 0) {
          cleanDataObj.publicWarnings = firmData.publicWarnings;
        }
        if (firmData.knownIssues && firmData.knownIssues.length > 0) {
          cleanDataObj.knownIssues = firmData.knownIssues;
        }
        if (firmData.discountCodes && Object.keys(firmData.discountCodes).length > 0) {
          cleanDataObj.discountCodes = firmData.discountCodes;
        }
        if (firmData.activationFee && Object.keys(firmData.activationFee).length > 0) {
          cleanDataObj.activationFee = firmData.activationFee;
        }
        if (firmData.ifTimeLimit && Object.keys(firmData.ifTimeLimit).length > 0) {
          cleanDataObj.ifTimeLimit = firmData.ifTimeLimit;
        }
        if (firmData.pressReleases && firmData.pressReleases.length > 0) {
          cleanDataObj.pressReleases = firmData.pressReleases;
        }

        // Remove any fields that are still null/undefined
        for (const key in cleanDataObj) {
          if (cleanDataObj[key] === null || cleanDataObj[key] === undefined) {
            delete cleanDataObj[key];
          }
        }

        // Set default status if not present
        if (!cleanDataObj.status) {
          cleanDataObj.status = 'ACTIVE';
        }

        console.log('📦 Creating prop firm with data:', JSON.stringify(cleanDataObj, null, 2));

        const firm = await prisma.propFirm.create({
          data: cleanDataObj,
        });

        // Create programs
        if (firmData.programs && firmData.programs.length > 0) {
          for (const program of firmData.programs) {
            await prisma.propFirmProgram.create({
              data: {
                name: program.name || program.type || 'Program',
                type: program.type || program.name || 'Standard',
                description: program.description || '',
                timeLimit: program.timeLimit || {},
                rules: program.rules || {},
                accountOptions: program.accountOptions || [],
                propFirmId: firm.id,
              },
            });
          }
        }

        // Create promotions
        if (firmData.promotions && firmData.promotions.length > 0) {
          for (const promo of firmData.promotions) {
            await prisma.propFirmPromotion.create({
              data: {
                name: promo.name,
                description: promo.description || '',
                discount: promo.discount || null,
                code: promo.code || '',
                validUntil: promo.validUntil ? new Date(promo.validUntil) : null,
                propFirmId: firm.id,
              },
            });
          }
        }

        results.push(firm);
      } catch (err: any) {
        console.error('Error importing firm:', err);
        errors.push({ name: firmData.name, error: err.message });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      imported: results.length, 
      errors
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import prop firms' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}