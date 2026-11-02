import {providerInputError} from "@/lib/provider-validation";
import {syncBrokerOfferings} from "@/lib/provider-offerings";
import {adminProviderList} from "@/lib/admin-provider-list";
import { requestUser } from "@/lib/request-user";
// app/api/admin/brokers/route.ts - COMPLETE UPDATED FILE WITH REGION FIELDS

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getAdminFromToken(request: NextRequest) {
  const user = await requestUser(request);
  return user?.role === "ADMIN" ? user : null;
}

// GET /api/admin/brokers - List all brokers
export async function GET(request:NextRequest){return adminProviderList(request,"brokers");}

// POST /api/admin/brokers - Create new broker
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const invalid=providerInputError(body,false);if(invalid)return NextResponse.json({error:invalid},{status:400});

    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    return await prisma.$transaction(async tx=>{
    const broker = await tx.broker.create({
      data: {
        name: body.name,
        slug,
        status: body.status || "ACTIVE",
        description: body.description || "",
        shortDescription: body.shortDescription,
        logo: body.logo,
        founded: body.founded ? parseInt(body.founded) : null,
        headquarters: body.headquarters,
        website: body.website,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        type: body.type || "Broker",
        category: body.category || "Multi-asset",
        targetAudience: body.targetAudience || [],
        regulated: body.regulated === true,
        regulation: body.regulation || {},
        safetyScore: body.safetyScore ? parseFloat(body.safetyScore) : null,
        rating: body.rating ? parseFloat(body.rating) : null,
        reviewsCount: body.reviewsCount ? parseInt(body.reviewsCount) : 0,
        expertRating: body.expertRating ? parseFloat(body.expertRating) : null,
        avgOverallRating: body.avgOverallRating
          ? parseFloat(body.avgOverallRating)
          : null,
        avgServiceRating: body.avgServiceRating
          ? parseFloat(body.avgServiceRating)
          : null,
        avgPlatformRating: body.avgPlatformRating
          ? parseFloat(body.avgPlatformRating)
          : null,
        avgValueRating: body.avgValueRating
          ? parseFloat(body.avgValueRating)
          : null,
        avgSupportRating: body.avgSupportRating
          ? parseFloat(body.avgSupportRating)
          : null,
        avgWithdrawalExperience: body.avgWithdrawalExperience
          ? parseFloat(body.avgWithdrawalExperience)
          : null,
        avgDepositExperience: body.avgDepositExperience
          ? parseFloat(body.avgDepositExperience)
          : null,
        avgCustomerSupport: body.avgCustomerSupport
          ? parseFloat(body.avgCustomerSupport)
          : null,
        avgTradingExperience: body.avgTradingExperience
          ? parseFloat(body.avgTradingExperience)
          : null,
        avgReliability: body.avgReliability
          ? parseFloat(body.avgReliability)
          : null,
        avgTrustScore: body.avgTrustScore
          ? parseFloat(body.avgTrustScore)
          : null,
        avgWithdrawalSuccess: body.avgWithdrawalSuccess
          ? parseFloat(body.avgWithdrawalSuccess)
          : null,
        avgExecutionQuality: body.avgExecutionQuality
          ? parseFloat(body.avgExecutionQuality)
          : null,
        recommendationRate: body.recommendationRate
          ? parseFloat(body.recommendationRate)
          : null,
        withdrawalStats: body.withdrawalStats || {},
        accountIssueStats: body.accountIssueStats || {},
        totalIncidents: body.totalIncidents ? parseInt(body.totalIncidents) : 0,
        incidentsLast7Days: body.incidentsLast7Days
          ? parseInt(body.incidentsLast7Days)
          : 0,
        incidentsLast30Days: body.incidentsLast30Days
          ? parseInt(body.incidentsLast30Days)
          : 0,
        withdrawalReports: body.withdrawalReports
          ? parseInt(body.withdrawalReports)
          : 0,
        withdrawalDelays: body.withdrawalDelays
          ? parseInt(body.withdrawalDelays)
          : 0,
        withdrawalConfirmed: body.withdrawalConfirmed
          ? parseInt(body.withdrawalConfirmed)
          : 0,
        withdrawalRejected: body.withdrawalRejected
          ? parseInt(body.withdrawalRejected)
          : 0,
        executionComplaints: body.executionComplaints
          ? parseInt(body.executionComplaints)
          : 0,
        slippageReports: body.slippageReports
          ? parseInt(body.slippageReports)
          : 0,
        spreadSpikeReports: body.spreadSpikeReports
          ? parseInt(body.spreadSpikeReports)
          : 0,
        platformIssues: body.platformIssues ? parseInt(body.platformIssues) : 0,
        serverDownReports: body.serverDownReports
          ? parseInt(body.serverDownReports)
          : 0,
        accountBansReported: body.accountBansReported
          ? parseInt(body.accountBansReported)
          : 0,
        accountSuspensions: body.accountSuspensions
          ? parseInt(body.accountSuspensions)
          : 0,
        resolvedIncidents: body.resolvedIncidents
          ? parseInt(body.resolvedIncidents)
          : 0,
        disputedIncidents: body.disputedIncidents
          ? parseInt(body.disputedIncidents)
          : 0,
        lastIncidentAt: body.lastIncidentAt
          ? new Date(body.lastIncidentAt)
          : null,
        minDeposit: body.minDeposit ? parseFloat(body.minDeposit) : null,
        maxLeverage: body.leverage,
        averageSpreads: body.spreads || {},
        commissions: body.commissions || {},
        leverageOptions: body.leverageOptions || {},
        features: body.features || [],
        platforms: body.platforms || [],
        instruments: body.instruments || {},
        demoAccount: body.demoAccount === true,
        islamicAccount: body.islamicAccount === true,
        depositMethods: body.depositMethods || [],
        withdrawalMethods: body.withdrawalMethods || [],
        withdrawalFee: body.withdrawalFee,
        minWithdrawal: body.minWithdrawal
          ? parseFloat(body.minWithdrawal)
          : null,
        supportLanguages: body.supportLanguages || [],
        supportAvailability: body.supportAvailability || "24/5",
        hasEducation: body.hasEducation === true,
        educationTypes: body.educationTypes || [],
        trustScore: body.trustScore ? parseInt(body.trustScore) : null,
        awards: body.awards || [],
        isRecommended: body.isRecommended === true,
        country: body.country,
        yearsInOperation: body.yearsInOperation
          ? parseInt(body.yearsInOperation)
          : null,
        assets: body.assets,
        promo: body.promo,
        maxAllocation: body.maxAllocation
          ? parseFloat(body.maxAllocation)
          : null,
        payout: body.payout ? parseFloat(body.payout) : null,
        bonusOffer: body.bonusOffer,
        bonus: body.bonus,
        highlight: body.highlight,
        signupLink: body.signupLink,
        accountSize: body.accountSize ? parseFloat(body.accountSize) : null,
        corporateAddress: body.corporateAddress,
        accountCurrencies: body.accountCurrencies || [],
        regulatoryWarnings: body.regulatoryWarnings || [],
        entityMapping: body.entityMapping,
        minTradeSize: body.minTradeSize,
        maxTradeSize: body.maxTradeSize,
        marginCall: body.marginCall,
        stopOutLevel: body.stopOutLevel,
        orderExecution: body.orderExecution,
        tradingHours: body.tradingHours,
        swapRates: body.swapRates,
        commissionNotes: body.commissionNotes,
        chartingTools: body.chartingTools || [],
        copyTradingAvailable: body.copyTradingAvailable === true,
        socialTradingAvailable: body.socialTradingAvailable === true,
        vpsAvailable: body.vpsAvailable === true,
        apiAvailable: body.apiAvailable === true,
        economicCalendar: body.economicCalendar === true,
        newsTrading: body.newsTrading === true,
        depositMethodsDetails: body.depositMethodsDetails,
        withdrawalMethodsDetails: body.withdrawalMethodsDetails,
        withdrawalProcessingTime: body.withdrawalProcessingTime,
        depositProcessingTime: body.depositProcessingTime,
        inactivityFee: body.inactivityFee,
        accountClosurePolicy: body.accountClosurePolicy,
        partnershipPrograms: body.partnershipPrograms || [],
        ibProgramAvailable: body.ibProgramAvailable === true,
        affiliateProgramAvailable: body.affiliateProgramAvailable === true,
        securityFeatures: body.securityFeatures || [],
        accountVerification: body.accountVerification,
        twoFactorAuth: body.twoFactorAuth === true,
        socialMedia: body.socialMedia,
        pressReleases: body.pressReleases,
        // ✅ REGION FIELDS FOR BROKER
        regions: body.regions || ["GLOBAL"],
        restrictedRegions: body.restrictedRegions || [],
        regionNotes: body.regionNotes || null,
        regionDescriptions: body.regionDescriptions || null,
        regionPricing: body.regionPricing || null,
        regionPaymentMethods: body.regionPaymentMethods || null,
      },
    });
    await syncBrokerOfferings(tx,broker.id,body);
    const createdBroker = await tx.broker.findUnique({
      where: { id: broker.id },
      include: {
        accountTypes: true,
        bonuses: true,
        promotions: true,
      },
    });

    await tx.auditEvent.create({data:{actorId:admin.id,action:"PROVIDER_CREATED",entityType:"brokers",entityId:String(broker.id)}});
    return NextResponse.json(
      { success: true, broker: createdBroker },
      { status: 201 },
    );
    },{timeout:20000});
  } catch (error) {
    console.error("Error creating broker:", error);
    return NextResponse.json(
      { error: "Failed to create broker" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/brokers - Delete broker (using query param)
export async function DELETE(request:NextRequest){try{const admin=await getAdminFromToken(request);if(!admin)return NextResponse.json({error:'Unauthorized'},{status:401});const id=Number(request.nextUrl.searchParams.get("id"));if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'Provider required'},{status:400});await prisma.$transaction(async tx=>{await tx.broker.update({where:{id},data:{status:'INACTIVE'}});await tx.auditEvent.create({data:{actorId:admin.id,action:'PROVIDER_UNPUBLISHED',entityType:'brokers',entityId:String(id)}});});return NextResponse.json({success:true,message:'Provider unpublished. Records and contributions are preserved.'});}catch{return NextResponse.json({error:'Provider could not be unpublished'},{status:400});}}
