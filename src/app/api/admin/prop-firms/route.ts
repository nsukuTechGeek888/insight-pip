// app/api/admin/prop-firms/route.ts
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

// GET /api/admin/prop-firms - List all prop firms
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📡 Admin fetching prop firms...');

    const firms = await prisma.propFirm.findMany({
      include: {
        programs: true,
        promotions: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${firms.length} prop firms for admin`);

    return NextResponse.json({ success: true, firms });
  } catch (error) {
    console.error('Error fetching prop firms:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch prop firms'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/prop-firms - Create new prop firm
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    console.log('📦 Admin creating prop firm:', body.name);

    // Clean the data - only include fields that exist
    const cleanData: any = {
      name: body.name,
      slug: slug,
      status: body.status || 'ACTIVE',
      description: body.description || '',
      shortDescription: body.shortDescription || '',
      logo: body.logo || '',
      website: body.website || '',
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      type: body.type || 'Prop Firm',
      category: body.category || 'Multi-asset',
      regulated: body.regulated || false,
      country: body.country || '',
      signupLink: body.signupLink || '',
      payoutFrequency: body.payoutFrequency || '',
      payoutMethods: body.payoutMethods || [],
      platforms: body.platforms || [],
      features: body.features || [],
      tradingInstruments: body.tradingInstruments || [],
      assets: body.assets || [],
      supportedCountries: body.supportedCountries || [],
      prohibitedCountries: body.prohibitedCountries || [],
      customerSupport: body.customerSupport || [],
      hasEducation: body.hasEducation || false,
      educationResources: body.educationResources || [],
      communityFeatures: body.communityFeatures || [],
    };

    // Add optional fields if they exist
    if (body.founded) cleanData.founded = parseInt(body.founded);
    if (body.foundedMonth) cleanData.foundedMonth = body.foundedMonth;
    if (body.headquarters) cleanData.headquarters = body.headquarters;
    if (body.yearsInOperation) cleanData.yearsInOperation = parseInt(body.yearsInOperation);
    if (body.minimumPayout) cleanData.minimumPayout = parseFloat(body.minimumPayout);
    if (body.payoutProcessingTime) cleanData.payoutProcessingTime = body.payoutProcessingTime;
    if (body.minimumAge) cleanData.minimumAge = parseInt(body.minimumAge);
    if (body.newsTradingRestrictions) cleanData.newsTradingRestrictions = body.newsTradingRestrictions;
    if (body.isRecommended) cleanData.isRecommended = body.isRecommended;
    if (body.regulation) cleanData.regulation = body.regulation;
    if (body.ceo) cleanData.ceo = body.ceo;
    if (body.legalName) cleanData.legalName = body.legalName;
    if (body.corporateAddress) cleanData.corporateAddress = body.corporateAddress;
    if (body.additionalOffice) cleanData.additionalOffice = body.additionalOffice;
    if (body.trustpilotRating) cleanData.trustpilotRating = parseFloat(body.trustpilotRating);
    if (body.trustpilotReviews) cleanData.trustpilotReviews = parseInt(body.trustpilotReviews);
    if (body.trustpilotUrl) cleanData.trustpilotUrl = body.trustpilotUrl;
    if (body.totalPayoutsPaid) cleanData.totalPayoutsPaid = body.totalPayoutsPaid;
    if (body.totalTradersServed) cleanData.totalTradersServed = parseInt(body.totalTradersServed);
    if (body.dailyTradeCount) cleanData.dailyTradeCount = parseInt(body.dailyTradeCount);
    if (body.countriesServed) cleanData.countriesServed = parseInt(body.countriesServed);
    if (body.riskLevel) cleanData.riskLevel = body.riskLevel;
    if (body.riskScore) cleanData.riskScore = parseInt(body.riskScore);
    if (body.recommendation) cleanData.recommendation = body.recommendation;
    if (body.maxAccountSize) cleanData.maxAccountSize = parseInt(body.maxAccountSize);
    if (body.maxAccountSizeCurrency) cleanData.maxAccountSizeCurrency = body.maxAccountSizeCurrency;
    if (body.maxAllocation) cleanData.maxAllocation = parseFloat(body.maxAllocation);
    if (body.rating) cleanData.rating = parseFloat(body.rating);
    if (body.reviewsCount) cleanData.reviewsCount = parseInt(body.reviewsCount);
    if (body.avgTrustScore) cleanData.avgTrustScore = parseFloat(body.avgTrustScore);
    if (body.recommendationRate) cleanData.recommendationRate = parseFloat(body.recommendationRate);
    if (body.safetyScore) cleanData.safetyScore = parseFloat(body.safetyScore);
    if (body.goatGuard) cleanData.goatGuard = body.goatGuard;
    if (body.newsTrading) cleanData.newsTrading = body.newsTrading;
    if (body.twoFactorAuth) cleanData.twoFactorAuth = body.twoFactorAuth;
    if (body.positiveReviewThemes) cleanData.positiveReviewThemes = body.positiveReviewThemes;
    if (body.negativeReviewThemes) cleanData.negativeReviewThemes = body.negativeReviewThemes;
    if (body.supportAgents) cleanData.supportAgents = body.supportAgents;
    if (body.warnings) cleanData.warnings = body.warnings;
    if (body.regulatoryWarnings) cleanData.regulatoryWarnings = body.regulatoryWarnings;
    if (body.regulatoryBodies) cleanData.regulatoryBodies = body.regulatoryBodies;
    if (body.leverageOptions) cleanData.leverageOptions = body.leverageOptions;
    if (body.entityMapping) cleanData.entityMapping = body.entityMapping;
    if (body.profitCaps) cleanData.profitCaps = body.profitCaps;
    if (body.scalingPlan) cleanData.scalingPlan = body.scalingPlan;
    if (body.socialMedia) cleanData.socialMedia = body.socialMedia;
    if (body.chartingTools) cleanData.chartingTools = body.chartingTools;
    if (body.securityFeatures) cleanData.securityFeatures = body.securityFeatures;
    if (body.redFlags) cleanData.redFlags = body.redFlags;
    if (body.greenFlags) cleanData.greenFlags = body.greenFlags;
    if (body.riskFactors) cleanData.riskFactors = body.riskFactors;
    if (body.systemBugs) cleanData.systemBugs = body.systemBugs;
    if (body.knownIssues) cleanData.knownIssues = body.knownIssues;
    if (body.publicWarnings) cleanData.publicWarnings = body.publicWarnings;
    if (body.prohibitedStrategies) cleanData.prohibitedStrategies = body.prohibitedStrategies;
    if (body.copyTradingRules) cleanData.copyTradingRules = body.copyTradingRules;
    if (body.consistencyRule) cleanData.consistencyRule = body.consistencyRule;
    if (body.newsTradingWindow) cleanData.newsTradingWindow = body.newsTradingWindow;
    if (body.newsProfitCap) cleanData.newsProfitCap = parseInt(body.newsProfitCap);
    if (body.shortTradeMinDuration) cleanData.shortTradeMinDuration = parseInt(body.shortTradeMinDuration);
    if (body.activationFee) cleanData.activationFee = body.activationFee;
    if (body.discountCodes) cleanData.discountCodes = body.discountCodes;
    if (body.depositMethodsDetails) cleanData.depositMethodsDetails = body.depositMethodsDetails;
    if (body.withdrawalMethodsDetails) cleanData.withdrawalMethodsDetails = body.withdrawalMethodsDetails;
    if (body.withdrawalProcessingTime) cleanData.withdrawalProcessingTime = body.withdrawalProcessingTime;
    if (body.depositProcessingTime) cleanData.depositProcessingTime = body.depositProcessingTime;
    if (body.inactivityFee) cleanData.inactivityFee = body.inactivityFee;
    if (body.accountClosurePolicy) cleanData.accountClosurePolicy = body.accountClosurePolicy;
    if (body.partnershipPrograms) cleanData.partnershipPrograms = body.partnershipPrograms;
    if (body.ibProgramAvailable) cleanData.ibProgramAvailable = body.ibProgramAvailable;
    if (body.affiliateProgramAvailable) cleanData.affiliateProgramAvailable = body.affiliateProgramAvailable;
    if (body.accountVerification) cleanData.accountVerification = body.accountVerification;
    if (body.pressReleases) cleanData.pressReleases = body.pressReleases;
    if (body.otherReviewSites) cleanData.otherReviewSites = body.otherReviewSites;
    if (body.incidentTrends) cleanData.incidentTrends = body.incidentTrends;
    if (body.previousHeadquarters) cleanData.previousHeadquarters = body.previousHeadquarters;
    if (body.migrationStatus) cleanData.migrationStatus = body.migrationStatus;
    if (body.ceoBio) cleanData.ceoBio = body.ceoBio;
    if (body.leadershipTeam) cleanData.leadershipTeam = body.leadershipTeam;
    if (body.registrationNumber) cleanData.registrationNumber = body.registrationNumber;
    if (body.registrationCountry) cleanData.registrationCountry = body.registrationCountry;
    if (body.companyNumber) cleanData.companyNumber = body.companyNumber;
    if (body.expertRating) cleanData.expertRating = parseFloat(body.expertRating);
    if (body.avgOverallRating) cleanData.avgOverallRating = parseFloat(body.avgOverallRating);
    if (body.avgTradingConditions) cleanData.avgTradingConditions = parseFloat(body.avgTradingConditions);
    if (body.avgCustomerCare) cleanData.avgCustomerCare = parseFloat(body.avgCustomerCare);
    if (body.avgUserFriendliness) cleanData.avgUserFriendliness = parseFloat(body.avgUserFriendliness);
    if (body.avgPayoutProcess) cleanData.avgPayoutProcess = parseFloat(body.avgPayoutProcess);
    if (body.avgReliability) cleanData.avgReliability = parseFloat(body.avgReliability);
    if (body.avgExecutionQuality) cleanData.avgExecutionQuality = parseFloat(body.avgExecutionQuality);
    if (body.forexPeaceArmyRating) cleanData.forexPeaceArmyRating = parseFloat(body.forexPeaceArmyRating);
    if (body.minAccountSize) cleanData.minAccountSize = parseInt(body.minAccountSize);
    if (body.minDeposit) cleanData.minDeposit = parseFloat(body.minDeposit);
    if (body.accountCurrencies) cleanData.accountCurrencies = body.accountCurrencies;
    if (body.restrictedFeatures) cleanData.restrictedFeatures = body.restrictedFeatures;
    if (body.monthlySearches) cleanData.monthlySearches = parseInt(body.monthlySearches);
    if (body.monthlyTraffic) cleanData.monthlyTraffic = parseInt(body.monthlyTraffic);
    if (body.claimedPayouts) cleanData.claimedPayouts = body.claimedPayouts;
    if (body.tradersServed) cleanData.tradersServed = parseInt(body.tradersServed);
    if (body.countriesServed) cleanData.countriesServed = parseInt(body.countriesServed);
    if (body.monthlyTradingVolume) cleanData.monthlyTradingVolume = body.monthlyTradingVolume;
    if (body.totalPayoutsCurrency) cleanData.totalPayoutsCurrency = body.totalPayoutsCurrency;
    if (body.totalPayoutsVerified) cleanData.totalPayoutsVerified = body.totalPayoutsVerified;
    if (body.payoutVerificationSource) cleanData.payoutVerificationSource = body.payoutVerificationSource;
    if (body.awards) cleanData.awards = body.awards;
    if (body.highlight) cleanData.highlight = body.highlight;
    if (body.promo) cleanData.promo = body.promo;
    if (body.years) cleanData.years = parseInt(body.years);
    if (body.tradingConditions) cleanData.tradingConditions = parseFloat(body.tradingConditions);
    if (body.customerCare) cleanData.customerCare = parseFloat(body.customerCare);
    if (body.userFriendliness) cleanData.userFriendliness = parseFloat(body.userFriendliness);
    if (body.payoutProcess) cleanData.payoutProcess = parseFloat(body.payoutProcess);
    if (body.totalReviews) cleanData.totalReviews = parseInt(body.totalReviews);
    if (body.totalIncidents) cleanData.totalIncidents = parseInt(body.totalIncidents);
    if (body.incidentsLast7Days) cleanData.incidentsLast7Days = parseInt(body.incidentsLast7Days);
    if (body.incidentsLast30Days) cleanData.incidentsLast30Days = parseInt(body.incidentsLast30Days);
    if (body.withdrawalReports) cleanData.withdrawalReports = parseInt(body.withdrawalReports);
    if (body.withdrawalDelays) cleanData.withdrawalDelays = parseInt(body.withdrawalDelays);
    if (body.withdrawalConfirmed) cleanData.withdrawalConfirmed = parseInt(body.withdrawalConfirmed);
    if (body.withdrawalRejected) cleanData.withdrawalRejected = parseInt(body.withdrawalRejected);
    if (body.executionComplaints) cleanData.executionComplaints = parseInt(body.executionComplaints);
    if (body.slippageReports) cleanData.slippageReports = parseInt(body.slippageReports);
    if (body.platformIssues) cleanData.platformIssues = parseInt(body.platformIssues);
    if (body.serverDownReports) cleanData.serverDownReports = parseInt(body.serverDownReports);
    if (body.accountBansReported) cleanData.accountBansReported = parseInt(body.accountBansReported);
    if (body.ruleViolationDisputes) cleanData.ruleViolationDisputes = parseInt(body.ruleViolationDisputes);
    if (body.resolvedIncidents) cleanData.resolvedIncidents = parseInt(body.resolvedIncidents);
    if (body.disputedIncidents) cleanData.disputedIncidents = parseInt(body.disputedIncidents);
    if (body.lastIncidentAt) cleanData.lastIncidentAt = new Date(body.lastIncidentAt);
    if (body.lastReviewed) cleanData.lastReviewed = new Date(body.lastReviewed);
    if (body.warningDates) cleanData.warningDates = body.warningDates.map((d: string) => new Date(d));

    // Challenge fields
    if (body.oneStepAvailable) cleanData.oneStepAvailable = body.oneStepAvailable;
    if (body.oneStepProfitTarget) cleanData.oneStepProfitTarget = parseInt(body.oneStepProfitTarget);
    if (body.oneStepMaxDrawdown) cleanData.oneStepMaxDrawdown = parseInt(body.oneStepMaxDrawdown);
    if (body.oneStepDailyDrawdown) cleanData.oneStepDailyDrawdown = parseInt(body.oneStepDailyDrawdown);
    if (body.oneStepMinDays) cleanData.oneStepMinDays = parseInt(body.oneStepMinDays);
    if (body.oneStepMaxLossPerTrade) cleanData.oneStepMaxLossPerTrade = parseInt(body.oneStepMaxLossPerTrade);
    if (body.oneStepConsistency) cleanData.oneStepConsistency = parseInt(body.oneStepConsistency);
    if (body.twoStepAvailable) cleanData.twoStepAvailable = body.twoStepAvailable;
    if (body.twoStepProfitTarget1) cleanData.twoStepProfitTarget1 = parseInt(body.twoStepProfitTarget1);
    if (body.twoStepProfitTarget2) cleanData.twoStepProfitTarget2 = parseInt(body.twoStepProfitTarget2);
    if (body.twoStepMaxDrawdown) cleanData.twoStepMaxDrawdown = parseInt(body.twoStepMaxDrawdown);
    if (body.twoStepDailyDrawdown) cleanData.twoStepDailyDrawdown = parseInt(body.twoStepDailyDrawdown);
    if (body.twoStepMinDays1) cleanData.twoStepMinDays1 = parseInt(body.twoStepMinDays1);
    if (body.twoStepMinDays2) cleanData.twoStepMinDays2 = parseInt(body.twoStepMinDays2);
    if (body.twoStepMaxLossPerTrade) cleanData.twoStepMaxLossPerTrade = parseInt(body.twoStepMaxLossPerTrade);
    if (body.twoStepConsistency) cleanData.twoStepConsistency = parseInt(body.twoStepConsistency);
    
    if (body.instantFundingAvailable) cleanData.instantFundingAvailable = body.instantFundingAvailable;
    if (body.ifMaxDrawdown) cleanData.ifMaxDrawdown = parseInt(body.ifMaxDrawdown);
    if (body.ifDailyDrawdown) cleanData.ifDailyDrawdown = parseInt(body.ifDailyDrawdown);
    if (body.ifMinTradingDays) cleanData.ifMinTradingDays = parseInt(body.ifMinTradingDays);
    if (body.ifMaxLossPerTrade) cleanData.ifMaxLossPerTrade = parseInt(body.ifMaxLossPerTrade);
    if (body.ifConsistencyRule) cleanData.ifConsistencyRule = parseInt(body.ifConsistencyRule);
    if (body.ifProfitSplit) cleanData.ifProfitSplit = parseInt(body.ifProfitSplit);
    if (body.ifRewardCycle) cleanData.ifRewardCycle = body.ifRewardCycle;
    if (body.ifTimeLimit) cleanData.ifTimeLimit = body.ifTimeLimit;
    
    if (body.payLaterAvailable) cleanData.payLaterAvailable = body.payLaterAvailable;
    if (body.payLaterInitialFee) cleanData.payLaterInitialFee = parseInt(body.payLaterInitialFee);
    if (body.payLaterActivationFee) cleanData.payLaterActivationFee = parseInt(body.payLaterActivationFee);
    if (body.payLaterProfitTarget) cleanData.payLaterProfitTarget = parseInt(body.payLaterProfitTarget);
    if (body.payLaterMaxDrawdown) cleanData.payLaterMaxDrawdown = parseInt(body.payLaterMaxDrawdown);
    if (body.payLaterMaxLossPerTrade) cleanData.payLaterMaxLossPerTrade = parseInt(body.payLaterMaxLossPerTrade);
    if (body.payLaterConsistency) cleanData.payLaterConsistency = parseInt(body.payLaterConsistency);
    if (body.payLaterMaxAccounts) cleanData.payLaterMaxAccounts = parseInt(body.payLaterMaxAccounts);
    if (body.payLaterCountryCap) cleanData.payLaterCountryCap = parseInt(body.payLaterCountryCap);
    if (body.payLaterAccountSizes) cleanData.payLaterAccountSizes = body.payLaterAccountSizes;
    
    if (body.bogoAvailable) cleanData.bogoAvailable = body.bogoAvailable;
    if (body.bogoDiscount) cleanData.bogoDiscount = parseInt(body.bogoDiscount);
    if (body.bogoFreeAccounts) cleanData.bogoFreeAccounts = parseInt(body.bogoFreeAccounts);
    if (body.bogoFreeAccountTiming) cleanData.bogoFreeAccountTiming = body.bogoFreeAccountTiming;
    if (body.affiliateDiscountCode) cleanData.affiliateDiscountCode = body.affiliateDiscountCode;
    if (body.affiliateDiscountPercent) cleanData.affiliateDiscountPercent = parseInt(body.affiliateDiscountPercent);
    
    if (body.prohibitedStrategies) cleanData.prohibitedStrategies = body.prohibitedStrategies;
    if (body.hedgingAllowed !== undefined) cleanData.hedgingAllowed = body.hedgingAllowed;
    if (body.martingaleAllowed !== undefined) cleanData.martingaleAllowed = body.martingaleAllowed;
    if (body.copyTradingAllowed !== undefined) cleanData.copyTradingAllowed = body.copyTradingAllowed;
    if (body.eaTrading !== undefined) cleanData.eaTrading = body.eaTrading;
    if (body.hftAllowed !== undefined) cleanData.hftAllowed = body.hftAllowed;
    if (body.weekendHolding !== undefined) cleanData.weekendHolding = body.weekendHolding;
    if (body.goatGuard !== undefined) cleanData.goatGuard = body.goatGuard;
    
    // Scaling level fields
    if (body.scalingLevel1Months) cleanData.scalingLevel1Months = parseInt(body.scalingLevel1Months);
    if (body.scalingLevel1Payouts) cleanData.scalingLevel1Payouts = parseInt(body.scalingLevel1Payouts);
    if (body.scalingLevel1Boost) cleanData.scalingLevel1Boost = parseInt(body.scalingLevel1Boost);
    if (body.scalingLevel1Split) cleanData.scalingLevel1Split = parseInt(body.scalingLevel1Split);
    if (body.scalingLevel1Drawdown) cleanData.scalingLevel1Drawdown = parseInt(body.scalingLevel1Drawdown);
    if (body.scalingLevel1Benefits) cleanData.scalingLevel1Benefits = body.scalingLevel1Benefits;
    
    if (body.scalingLevel2Months) cleanData.scalingLevel2Months = parseInt(body.scalingLevel2Months);
    if (body.scalingLevel2Payouts) cleanData.scalingLevel2Payouts = parseInt(body.scalingLevel2Payouts);
    if (body.scalingLevel2Boost) cleanData.scalingLevel2Boost = parseInt(body.scalingLevel2Boost);
    if (body.scalingLevel2Split) cleanData.scalingLevel2Split = parseInt(body.scalingLevel2Split);
    if (body.scalingLevel2Drawdown) cleanData.scalingLevel2Drawdown = parseInt(body.scalingLevel2Drawdown);
    if (body.scalingLevel2WeeklyPayouts) cleanData.scalingLevel2WeeklyPayouts = body.scalingLevel2WeeklyPayouts;
    if (body.scalingLevel2Benefits) cleanData.scalingLevel2Benefits = body.scalingLevel2Benefits;
    
    if (body.scalingLevel3Months) cleanData.scalingLevel3Months = parseInt(body.scalingLevel3Months);
    if (body.scalingLevel3Payouts) cleanData.scalingLevel3Payouts = parseInt(body.scalingLevel3Payouts);
    if (body.scalingLevel3Boost) cleanData.scalingLevel3Boost = parseInt(body.scalingLevel3Boost);
    if (body.scalingLevel3Split) cleanData.scalingLevel3Split = parseInt(body.scalingLevel3Split);
    if (body.scalingLevel3Drawdown) cleanData.scalingLevel3Drawdown = parseInt(body.scalingLevel3Drawdown);
    if (body.scalingLevel3MonthlySalary) cleanData.scalingLevel3MonthlySalary = parseInt(body.scalingLevel3MonthlySalary);
    if (body.scalingLevel3FreeChallenge) cleanData.scalingLevel3FreeChallenge = body.scalingLevel3FreeChallenge;
    if (body.scalingLevel3Benefits) cleanData.scalingLevel3Benefits = body.scalingLevel3Benefits;
    
    if (body.scalingLevel4Months) cleanData.scalingLevel4Months = parseInt(body.scalingLevel4Months);
    if (body.scalingLevel4Payouts) cleanData.scalingLevel4Payouts = parseInt(body.scalingLevel4Payouts);
    if (body.scalingLevel4Boost) cleanData.scalingLevel4Boost = parseInt(body.scalingLevel4Boost);
    if (body.scalingLevel4Split) cleanData.scalingLevel4Split = parseInt(body.scalingLevel4Split);
    if (body.scalingLevel4Drawdown) cleanData.scalingLevel4Drawdown = parseInt(body.scalingLevel4Drawdown);
    if (body.scalingLevel4MonthlySalary) cleanData.scalingLevel4MonthlySalary = parseInt(body.scalingLevel4MonthlySalary);
    if (body.scalingLevel4FreeChallenge) cleanData.scalingLevel4FreeChallenge = body.scalingLevel4FreeChallenge;
    if (body.scalingLevel4Benefits) cleanData.scalingLevel4Benefits = body.scalingLevel4Benefits;
    if (body.scalingLevelMax) cleanData.scalingLevelMax = parseInt(body.scalingLevelMax);

    // Remove any undefined values
    for (const key in cleanData) {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    }

    console.log('🧹 Cleaned admin create data:', Object.keys(cleanData));

    const firm = await prisma.propFirm.create({
      data: cleanData,
    });

    // Create programs if provided
    if (body.programs && body.programs.length > 0) {
      for (const program of body.programs) {
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

    // Create promotions if provided
    if (body.promotions && body.promotions.length > 0) {
      for (const promo of body.promotions) {
        await prisma.propFirmPromotion.create({
          data: {
            name: promo.name || 'Promotion',
            description: promo.description || '',
            discount: promo.discount || null,
            code: promo.code || '',
            validUntil: promo.validUntil ? new Date(promo.validUntil) : null,
            propFirmId: firm.id,
          },
        });
      }
    }

    const createdFirm = await prisma.propFirm.findUnique({
      where: { id: firm.id },
      include: {
        programs: true,
        promotions: true,
      },
    });

    return NextResponse.json({ success: true, firm: createdFirm }, { status: 201 });
  } catch (error) {
    console.error('Error creating prop firm:', error);
    return NextResponse.json({ error: 'Failed to create prop firm' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/prop-firms - Delete prop firm (query param)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Prop firm ID required' }, { status: 400 });
    }

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