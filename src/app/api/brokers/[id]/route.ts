// app/api/brokers/[id]/route.ts - COMPLETE WITH REGION CHECK

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  getRegionFromRequest, 
  isAvailableInRegion, 
  getAvailableRegions,
  getRegionEntityName,
  getRegionDescription,
  getRegionPricing,
  getRegionPaymentMethods
} from '@/lib/region';

const prisma = new PrismaClient();

function safeJSONParse(value: any) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (value === '[object Object]' || value.includes('[object Object]')) {
    console.warn('⚠️ Found malformed JSON data for field, returning null');
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    console.error('Error parsing JSON, returning null');
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📡 API Request for broker identifier:', id);
    
    // ====== REGION DETECTION ======
    const region = getRegionFromRequest(request);
    console.log(`📍 Region: ${region}`);
    
    const isNumeric = /^\d+$/.test(id);
    
    let broker;
    
    if (isNumeric) {
      const brokerId = parseInt(id);
      console.log('🔍 Fetching by ID:', brokerId);
      
      broker = await prisma.broker.findUnique({
        where: { id: brokerId },
        include: {
          accountTypes: true,
          bonuses: {
            where: {
              OR: [
                { regions: { has: region } },
                { regions: { has: 'GLOBAL' } },
                { regions: { isEmpty: true } },
              ],
              NOT: {
                restrictedRegions: { has: region }
              }
            }
          },
          promotions: {
            where: {
              OR: [
                { regions: { has: region } },
                { regions: { has: 'GLOBAL' } },
                { regions: { isEmpty: true } },
              ],
              NOT: {
                restrictedRegions: { has: region }
              }
            }
          },
        }
      });
    } else {
      console.log('🔍 Fetching by slug:', id);
      
      broker = await prisma.broker.findUnique({
        where: { slug: id },
        include: {
          accountTypes: true,
          bonuses: {
            where: {
              OR: [
                { regions: { has: region } },
                { regions: { has: 'GLOBAL' } },
                { regions: { isEmpty: true } },
              ],
              NOT: {
                restrictedRegions: { has: region }
              }
            }
          },
          promotions: {
            where: {
              OR: [
                { regions: { has: region } },
                { regions: { has: 'GLOBAL' } },
                { regions: { isEmpty: true } },
              ],
              NOT: {
                restrictedRegions: { has: region }
              }
            }
          },
        }
      });
    }
    
    if (!broker) {
      console.log('❌ Broker not found for identifier:', id);
      return NextResponse.json(
        { success: false, error: 'Broker not found' },
        { status: 404 }
      );
    }
    
    // ====== REGION AVAILABILITY CHECK ======
    const availableInRegion = isAvailableInRegion(broker, region);
    
    if (!availableInRegion) {
      const availableRegions = getAvailableRegions(broker);
      const regionNames = availableRegions.map(r => {
        const info: any = { SA: 'South Africa', EU: 'Europe', UK: 'United Kingdom', UAE: 'United Arab Emirates', KE: 'Kenya', AU: 'Australia', SG: 'Singapore', US: 'United States', CA: 'Canada', GLOBAL: 'Global' };
        return info[r] || r;
      });
      
      return NextResponse.json({
        success: false,
        error: 'NOT_AVAILABLE_IN_REGION',
        message: `${broker.name} is not available in your region`,
        region: region,
        availableRegions: availableRegions,
        availableRegionNames: regionNames,
        alternatives: [], // We'll fetch alternatives in the frontend
      }, { status: 403 });
    }
    
    console.log('✅ Found broker:', broker.name);
    
    const regulation = safeJSONParse(broker.regulation);
    const spreads = safeJSONParse(broker.averageSpreads) || {};
    const commissions = safeJSONParse(broker.commissions) || {};
    const instruments = safeJSONParse(broker.instruments) || {};
    const socialMedia = safeJSONParse(broker.socialMedia) || {};
    const leverageOptions = safeJSONParse(broker.leverageOptions) || {};
    const entityMapping = safeJSONParse(broker.entityMapping) || {};
    const depositMethodsDetails = safeJSONParse(broker.depositMethodsDetails) || [];
    const withdrawalMethodsDetails = safeJSONParse(broker.withdrawalMethodsDetails) || [];
    const regionNotes = safeJSONParse(broker.regionNotes) || {};
    const regionDescriptions = safeJSONParse(broker.regionDescriptions) || {};
    const regionPricing = safeJSONParse(broker.regionPricing) || {};
    const regionPaymentMethods = safeJSONParse(broker.regionPaymentMethods) || {};
    
    const withdrawalStats = safeJSONParse(broker.withdrawalStats) || {
      sameDay: 0,
      oneToThreeDays: 0,
      threeToSevenDays: 0,
      sevenPlusDays: 0,
      stillWaiting: 0
    };
    
    const accountIssueStats = safeJSONParse(broker.accountIssueStats) || {
      noIssues: 0,
      temporarySuspension: 0,
      withdrawalDelayed: 0,
      withdrawalRejected: 0,
      accountTerminated: 0,
      ruleViolation: 0
    };
    
    const bonuses = broker.bonuses.map(bonus => ({
      type: bonus.type,
      amount: bonus.amount,
      conditions: bonus.conditions || '',
      expiry: bonus.expiry || 'Ongoing',
      code: bonus.code || '',
      regions: bonus.regions || ['GLOBAL'],
      restrictedRegions: bonus.restrictedRegions || [],
    }));
    
    const promotions = broker.promotions.map(promo => ({
      name: promo.name,
      description: promo.description || '',
      discount: promo.discount || '',
      code: promo.code || '',
      validUntil: promo.validUntil,
      regions: promo.regions || ['GLOBAL'],
      restrictedRegions: promo.restrictedRegions || [],
    }));
    
    const support = {
      languages: broker.supportLanguages || [],
      availability: broker.supportAvailability || '24/5',
      channels: ['Live Chat', 'Email', 'Phone'],
      responseTime: 'Under 5 minutes (live chat)'
    };
    
    const education = {
      learningMaterials: broker.educationTypes || [],
      researchTools: ['Daily market analysis', 'Economic calendar', 'Trading signals', 'Market news']
    };
    
    const slug = broker.slug || broker.name.toLowerCase().replace(/\s+/g, '-');
    
    // ====== REGION-SPECIFIC CONTENT ======
    const regionEntityName = getRegionEntityName(broker, region);
    const regionDescription = regionDescriptions[region] || regionDescriptions.GLOBAL || broker.shortDescription || '';
    const regionPricingData = regionPricing[region] || regionPricing.GLOBAL || null;
    const regionPaymentData = regionPaymentMethods[region] || regionPaymentMethods.GLOBAL || null;
    const regionNote = regionNotes[region] || regionNotes.GLOBAL || null;
    
    const response = {
      id: broker.id,
      name: broker.name,
      slug: slug,
      description: broker.description || '',
      shortDescription: broker.shortDescription || '',
      logo: broker.logo || '',
      founded: broker.founded || 0,
      headquarters: broker.headquarters || '',
      website: broker.website,
      contactEmail: broker.contactEmail || '',
      contactPhone: broker.contactPhone || '',
      type: broker.type || 'Broker',
      category: broker.category || 'Multi-asset',
      targetAudience: broker.targetAudience || [],
      corporateAddress: broker.corporateAddress || '',
      accountCurrencies: broker.accountCurrencies || [],
      regulatoryWarnings: broker.regulatoryWarnings || [],
      entityMapping: entityMapping,
      // Region-specific fields
      region: region,
      availableInRegion: true,
      regionEntityName: regionEntityName,
      regionDescription: regionDescription,
      regionPricing: regionPricingData,
      regionPaymentMethods: regionPaymentData,
      regionNote: regionNote,
      regions: broker.regions || ['GLOBAL'],
      restrictedRegions: broker.restrictedRegions || [],
      minTradeSize: broker.minTradeSize || '0.01 lots',
      maxTradeSize: broker.maxTradeSize || '100 lots',
      marginCall: broker.marginCall || '100%',
      stopOutLevel: broker.stopOutLevel || '50%',
      orderExecution: broker.orderExecution || 'Market Execution',
      tradingHours: broker.tradingHours || '',
      swapRates: broker.swapRates || '',
      commissionNotes: broker.commissionNotes || '',
      chartingTools: broker.chartingTools || [],
      copyTradingAvailable: broker.copyTradingAvailable || false,
      socialTradingAvailable: broker.socialTradingAvailable || false,
      vpsAvailable: broker.vpsAvailable || false,
      apiAvailable: broker.apiAvailable || false,
      economicCalendar: broker.economicCalendar || false,
      newsTrading: broker.newsTrading || false,
      depositMethodsDetails: depositMethodsDetails,
      withdrawalMethodsDetails: withdrawalMethodsDetails,
      withdrawalProcessingTime: broker.withdrawalProcessingTime || '1-3 business days',
      depositProcessingTime: broker.depositProcessingTime || 'Instant',
      inactivityFee: broker.inactivityFee || '',
      accountClosurePolicy: broker.accountClosurePolicy || '',
      partnershipPrograms: broker.partnershipPrograms || [],
      ibProgramAvailable: broker.ibProgramAvailable || false,
      affiliateProgramAvailable: broker.affiliateProgramAvailable || false,
      securityFeatures: broker.securityFeatures || [],
      accountVerification: broker.accountVerification || '',
      twoFactorAuth: broker.twoFactorAuth || false,
      socialMedia: socialMedia,
      
      accountTypes: broker.accountTypes.map(acc => ({
        name: acc.name,
        minDeposit: acc.minDeposit || 0,
        commission: acc.commission || '',
        spreadType: acc.spreadType || '',
        swapFree: acc.swapFree || false,
        leverage: broker.maxLeverage || '1:100',
        baseCurrencies: 'USD, EUR, GBP'
      })),
      
      demoAccount: broker.demoAccount || false,
      islamicAccount: broker.islamicAccount || false,
      
      leverage: broker.maxLeverage || '1:100',
      spreads: spreads,
      commissions: commissions,
      leverageOptions: leverageOptions,
      
      platforms: broker.platforms || [],
      features: broker.features || [],
      
      instruments: instruments,
      
      depositMethods: broker.depositMethods || [],
      withdrawalMethods: broker.withdrawalMethods || [],
      withdrawalFee: broker.withdrawalFee || 'No fee',
      minWithdrawal: broker.minWithdrawal || 50,
      
      supportLanguages: broker.supportLanguages || [],
      supportAvailability: broker.supportAvailability || '24/5',
      support: support,
      education: education,
      hasEducation: broker.hasEducation || false,
      educationTypes: broker.educationTypes || [],
      
      regulated: broker.regulated || false,
      regulation: regulation || {
        authorities: [],
        compensationScheme: '',
        negativeBalanceProtection: false,
        segregatedAccounts: false
      },
      
      rating: broker.rating || 0,
      reviewsCount: broker.reviewsCount || 0,
      avgTrustScore: broker.avgTrustScore || 0,
      avgWithdrawalSuccess: broker.avgWithdrawalSuccess || 0,
      avgExecutionQuality: broker.avgExecutionQuality || 0,
      avgReliability: broker.avgReliability || 0,
      recommendationRate: broker.recommendationRate || 0,
      trustScore: broker.trustScore || 0,
      withdrawalStats: withdrawalStats,
      accountIssueStats: accountIssueStats,
      
      bonuses: bonuses,
      promotions: promotions,
      
      awards: broker.awards || [],
      isRecommended: broker.isRecommended || false,
      country: broker.country || '',
      yearsInOperation: broker.yearsInOperation || 0,
      years: broker.years || 0,
      assets: broker.assets || '',
      promo: broker.promo || '',
      maxAllocation: broker.maxAllocation || 0,
      payout: broker.payout || 0,
      bonusOffer: broker.bonusOffer || '',
      bonus: broker.bonus || '',
      highlight: broker.highlight || '',
      signupLink: broker.signupLink || broker.website,
      accountSize: broker.accountSize || 0,
      status: broker.status || 'ACTIVE',
      
      totalIncidents: broker.totalIncidents || 0,
      incidentsLast7Days: broker.incidentsLast7Days || 0,
      incidentsLast30Days: broker.incidentsLast30Days || 0,
      withdrawalReports: broker.withdrawalReports || 0,
      withdrawalDelays: broker.withdrawalDelays || 0,
      withdrawalConfirmed: broker.withdrawalConfirmed || 0,
      withdrawalRejected: broker.withdrawalRejected || 0,
      executionComplaints: broker.executionComplaints || 0,
      slippageReports: broker.slippageReports || 0,
      spreadSpikeReports: broker.spreadSpikeReports || 0,
      platformIssues: broker.platformIssues || 0,
      serverDownReports: broker.serverDownReports || 0,
      accountBansReported: broker.accountBansReported || 0,
      accountSuspensions: broker.accountSuspensions || 0,
      resolvedIncidents: broker.resolvedIncidents || 0,
      disputedIncidents: broker.disputedIncidents || 0,
      lastIncidentAt: broker.lastIncidentAt,
      
      reviewHighlights: {
        tradingConditions: broker.rating || 0,
        platformStability: broker.rating || 0,
        customerSupport: broker.rating || 0,
        withdrawalSpeed: broker.rating || 0,
        education: broker.rating || 0
      }
    };
    
    return NextResponse.json({
      success: true,
      data: response,
      region: {
        current: region,
        available: true,
      }
    });
    
  } catch (error) {
    console.error('Error fetching broker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch broker' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}