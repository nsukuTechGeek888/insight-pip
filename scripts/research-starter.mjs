// These local drafts require an editorial review of regional eligibility before publication.
export async function addResearchDrafts(prisma) {
  await prisma.$transaction(async tx => {
    const key = "local-research-starter-v1";
    if (await tx.platformSetting.findUnique({ where: { key } })) return;
    const verifiedAt = new Date("2026-11-07T00:00:00Z");
    const broker = await tx.broker.create({ data: {
      name: "Pepperstone", slug: "pepperstone", website: "https://pepperstone.com",
      status: "INACTIVE", regions: [], trustScore: null, rating: null, safetyScore: null,
      shortDescription: "CFD broker offering Standard and Razor accounts.",
      regionNotes: "South African contracting entity and eligibility require confirmation.",
      accountTypes: { create: [
        { name: "Standard", commission: "Spread-based pricing. Share CFDs and overnight funding have separate charges." },
        { name: "Razor", spreadType: "Raw spreads", commission: "Commission-based pricing on FX and XAU/USD CFDs." },
      ] },
    } });
    const firm = await tx.propFirm.create({ data: {
      name: "FTMO", slug: "ftmo", website: "https://ftmo.com",
      status: "INACTIVE", regions: [], rating: null,
      shortDescription: "Provider of simulated trading evaluations.",
      regionNotes: "South African eligibility and current checkout fees require confirmation.",
      programs: { create: { name: "FTMO Challenge: 2-Step", type: "Two-phase evaluation",
        rules: { phaseOneProfitTarget: "10%", phaseTwoProfitTarget: "5%", maximumDailyLoss: "5%", maximumLoss: "10%", minimumTradingDays: 4 },
        timeLimit: { tradingPeriod: "Unlimited" },
      } },
    } });
    await tx.providerSource.createMany({ data: [
      { entityType: "brokers", entityId: broker.id, category: "Accounts", label: "Pepperstone account comparison", url: "https://pepperstone.com/en/trading/trading-accounts", verifiedAt },
      { entityType: "prop-firms", entityId: firm.id, category: "Challenges", label: "FTMO 2-Step objectives", url: "https://ftmo.com/en/2-step-challenge/", verifiedAt },
    ] });
    await tx.platformSetting.create({ data: { key, value: true } });
  });
}
