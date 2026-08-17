// prisma/seed-unified.ts - SIMPLIFIED WITH HARDCODED DATA

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===== REGION MAPPINGS =====
const BROKER_REGIONS: Record<string, { regions: string[]; restrictedRegions: string[] }> = {
  'XM': { regions: ['GLOBAL', 'SA', 'EU', 'UAE', 'KE', 'MU'], restrictedRegions: ['US', 'CA', 'IR'] },
  'Exness': { regions: ['GLOBAL', 'SA', 'EU', 'UAE', 'KE', 'MU'], restrictedRegions: ['US', 'CA', 'IR', 'UK'] },
  'Pepperstone': { regions: ['GLOBAL', 'SA', 'EU', 'UAE', 'AU', 'KE'], restrictedRegions: ['US', 'CA'] },
  'IC Markets': { regions: ['GLOBAL', 'SA', 'EU', 'AU', 'KE'], restrictedRegions: ['US'] },
  'FX Pro': { regions: ['GLOBAL', 'SA', 'EU', 'UAE', 'KE'], restrictedRegions: ['US', 'CA'] },
  'PU Prime': { regions: ['SA', 'UAE', 'KE', 'MU', 'SC'], restrictedRegions: ['US', 'EU', 'UK', 'SG', 'CN'] },
  'Deriv': { regions: ['GLOBAL', 'SA', 'EU', 'UAE', 'MU'], restrictedRegions: ['US', 'CA'] },
  'RCG Markets': { regions: ['SA'], restrictedRegions: ['US', 'EU', 'UK', 'CA', 'AU'] },
};

const PROP_FIRM_REGIONS: Record<string, { regions: string[]; restrictedRegions: string[] }> = {
  'GFT': { regions: ['GLOBAL', 'SA', 'EU', 'UAE', 'AU', 'KE'], restrictedRegions: ['US', 'CA'] },
};

// ===== HARDCODED BROKER DATA =====
const brokersData = [
  {
    name: 'XM',
    description: 'XM is a globally recognized forex broker offering competitive spreads and a wide range of trading instruments.',
    logo: '/images/brokers/xm.png',
    website: 'https://xm.com',
    founded: 2009,
    headquarters: 'Cyprus',
    type: 'Broker',
    regulated: true,
    minDeposit: 5,
    leverage: '1:1000',
    platforms: ['MT4', 'MT5', 'WebTrader'],
    features: ['Copy Trading', 'Trading Central', 'Economic Calendar'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    support: { languages: ['English', 'Arabic', 'Spanish'], availability: '24/5' },
    awards: ['Best Forex Broker 2023', 'Best Customer Service 2022'],
    suitableFor: ['Beginners', 'Intermediate', 'Professional'],
    spreads: { eurusd: '0.6 - 1.2 pips' },
    commissions: { forex: '0 commission' },
    instruments: { forex: 55, stocks: 1000, crypto: 20 },
    country: 'Cyprus',
    yearsInOperation: 15,
    assets: 'Forex, Stocks, Crypto, Commodities, Indices',
    signupLink: 'https://xm.com/join',
    rating: 4.8,
    reviewsCount: 2500,
    bonusOffer: '100% Deposit Bonus up to $500',
  },
  {
    name: 'Exness',
    description: 'Exness is a leading forex broker known for its transparent pricing and instant withdrawals.',
    logo: '/images/brokers/exness.png',
    website: 'https://exness.com',
    founded: 2008,
    headquarters: 'Cyprus',
    type: 'Broker',
    regulated: true,
    minDeposit: 10,
    leverage: '1:2000',
    platforms: ['MT4', 'MT5', 'WebTrader'],
    features: ['Instant Withdrawals', 'Copy Trading', 'VPS'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller', 'Crypto'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller', 'Crypto'],
    support: { languages: ['English', 'Chinese', 'Arabic', 'Spanish'], availability: '24/7' },
    awards: ['Best Trading Experience 2023', 'Most Transparent Broker 2022'],
    suitableFor: ['Beginners', 'Intermediate', 'Professional'],
    spreads: { eurusd: '0.1 - 0.5 pips' },
    commissions: { forex: '0 commission' },
    instruments: { forex: 100, stocks: 200, crypto: 30 },
    country: 'Cyprus',
    yearsInOperation: 16,
    assets: 'Forex, Stocks, Crypto, Commodities, Indices',
    signupLink: 'https://exness.com/join',
    rating: 4.9,
    reviewsCount: 3200,
    bonusOffer: 'Instant Withdrawals',
  },
  {
    name: 'Pepperstone',
    description: 'Pepperstone is a trusted forex broker offering low spreads and fast execution.',
    logo: '/images/brokers/pepperstone.png',
    website: 'https://pepperstone.com',
    founded: 2010,
    headquarters: 'Australia',
    type: 'Broker',
    regulated: true,
    minDeposit: 200,
    leverage: '1:500',
    platforms: ['MT4', 'MT5', 'cTrader', 'TradingView'],
    features: ['Copy Trading', 'Trading Signals', 'Economic Calendar'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    support: { languages: ['English', 'Chinese', 'Spanish'], availability: '24/5' },
    awards: ['Best Forex Broker 2023', 'Best Trading Platform 2022'],
    suitableFor: ['Intermediate', 'Professional'],
    spreads: { eurusd: '0.0 - 0.5 pips' },
    commissions: { forex: '$3.50 per lot' },
    instruments: { forex: 100, stocks: 200, crypto: 20 },
    country: 'Australia',
    yearsInOperation: 14,
    assets: 'Forex, Stocks, Crypto, Commodities, Indices',
    signupLink: 'https://pepperstone.com/join',
    rating: 4.8,
    reviewsCount: 2100,
    bonusOffer: '0% Commission on Forex',
  },
  {
    name: 'IC Markets',
    description: 'IC Markets is a leading forex broker with tight spreads and advanced trading platforms.',
    logo: '/images/brokers/icmarkets.png',
    website: 'https://icmarkets.com',
    founded: 2007,
    headquarters: 'Australia',
    type: 'Broker',
    regulated: true,
    minDeposit: 200,
    leverage: '1:500',
    platforms: ['MT4', 'MT5', 'cTrader'],
    features: ['Copy Trading', 'Trading Signals', 'VPS'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    support: { languages: ['English', 'Chinese', 'Spanish'], availability: '24/5' },
    awards: ['Best Forex Broker 2023', 'Best Trading Conditions 2022'],
    suitableFor: ['Intermediate', 'Professional'],
    spreads: { eurusd: '0.0 - 0.5 pips' },
    commissions: { forex: '$3.50 per lot' },
    instruments: { forex: 100, stocks: 200, crypto: 20 },
    country: 'Australia',
    yearsInOperation: 17,
    assets: 'Forex, Stocks, Crypto, Commodities, Indices',
    signupLink: 'https://icmarkets.com/join',
    rating: 4.7,
    reviewsCount: 1900,
    bonusOffer: 'VIP Trading Conditions',
  },
  {
    name: 'FX Pro',
    description: 'FX Pro is a well-established forex broker offering competitive trading conditions.',
    logo: '/images/brokers/fxpro.png',
    website: 'https://fxpro.com',
    founded: 2006,
    headquarters: 'UK',
    type: 'Broker',
    regulated: true,
    minDeposit: 100,
    leverage: '1:200',
    platforms: ['MT4', 'MT5', 'WebTrader'],
    features: ['Copy Trading', 'Trading Central'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    support: { languages: ['English', 'Arabic', 'Spanish'], availability: '24/5' },
    awards: ['Best Forex Broker 2023', 'Best Customer Support 2022'],
    suitableFor: ['Beginners', 'Intermediate', 'Professional'],
    spreads: { eurusd: '0.6 - 1.2 pips' },
    commissions: { forex: '0 commission' },
    instruments: { forex: 70, stocks: 200, crypto: 20 },
    country: 'UK',
    yearsInOperation: 18,
    assets: 'Forex, Stocks, Crypto, Commodities, Indices',
    signupLink: 'https://fxpro.com/join',
    rating: 4.6,
    reviewsCount: 1800,
    bonusOffer: '100% Deposit Bonus',
  },
  {
    name: 'PU Prime',
    description: 'PU Prime is a forex broker focused on the South African market with competitive spreads.',
    logo: '/images/brokers/puprime.png',
    website: 'https://puprime.com',
    founded: 2015,
    headquarters: 'South Africa',
    type: 'Broker',
    regulated: true,
    minDeposit: 50,
    leverage: '1:500',
    platforms: ['MT4', 'MT5', 'WebTrader'],
    features: ['Copy Trading', 'Trading Signals', 'Economic Calendar'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller', 'Ozow'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller', 'Ozow'],
    support: { languages: ['English', 'Afrikaans', 'Zulu'], availability: '24/5' },
    awards: ['Best Forex Broker South Africa 2023'],
    suitableFor: ['Beginners', 'Intermediate'],
    spreads: { eurusd: '0.8 - 1.5 pips' },
    commissions: { forex: '0 commission' },
    instruments: { forex: 50, stocks: 100, crypto: 15 },
    country: 'South Africa',
    yearsInOperation: 9,
    assets: 'Forex, Stocks, Crypto, Commodities',
    signupLink: 'https://puprime.com/join',
    rating: 4.5,
    reviewsCount: 500,
    bonusOffer: '50% Deposit Bonus for SA Clients',
  },
  {
    name: 'Deriv',
    description: 'Deriv is a leading online trading platform offering CFDs on forex, commodities, and more.',
    logo: '/images/brokers/deriv.png',
    website: 'https://deriv.com',
    founded: 1999,
    headquarters: 'Isle of Man',
    type: 'Broker',
    regulated: true,
    minDeposit: 5,
    leverage: '1:1000',
    platforms: ['Deriv Platform', 'MT5'],
    features: ['Copy Trading', 'Trading Signals'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Skrill', 'Neteller'],
    support: { languages: ['English', 'Spanish', 'French'], availability: '24/5' },
    awards: ['Best Trading Platform 2023'],
    suitableFor: ['Beginners', 'Intermediate'],
    spreads: { eurusd: '0.5 - 1.2 pips' },
    commissions: { forex: '0 commission' },
    instruments: { forex: 50, stocks: 100, crypto: 20 },
    country: 'Isle of Man',
    yearsInOperation: 25,
    assets: 'Forex, Stocks, Crypto, Commodities, Indices',
    signupLink: 'https://deriv.com/join',
    rating: 4.4,
    reviewsCount: 1500,
    bonusOffer: 'No Deposit Bonus up to $25',
  },
  {
    name: 'RCG Markets',
    description: 'RCG Markets is a South African forex broker offering local payment methods and support.',
    logo: '/images/brokers/rcgmarkets.png',
    website: 'https://rcgmarkets.com',
    founded: 2018,
    headquarters: 'South Africa',
    type: 'Broker',
    regulated: true,
    minDeposit: 250,
    leverage: '1:400',
    platforms: ['MT4', 'MT5'],
    features: ['Trading Signals', 'Economic Calendar'],
    depositMethods: ['Credit Card', 'Bank Transfer', 'Ozow', 'Payfast'],
    withdrawalMethods: ['Credit Card', 'Bank Transfer', 'Ozow', 'Payfast'],
    support: { languages: ['English', 'Afrikaans'], availability: '24/5' },
    awards: ['Fastest Growing Broker SA 2023'],
    suitableFor: ['Intermediate', 'Professional'],
    spreads: { eurusd: '0.5 - 1.0 pips' },
    commissions: { forex: '$3.50 per lot' },
    instruments: { forex: 40, stocks: 50, crypto: 10 },
    country: 'South Africa',
    yearsInOperation: 6,
    assets: 'Forex, Stocks, Crypto',
    signupLink: 'https://rcgmarkets.com/join',
    rating: 4.2,
    reviewsCount: 300,
    bonusOffer: '100% Deposit Bonus for SA Clients',
  },
];

// ===== HARDCODED PROP FIRM DATA =====
const propFirmsData = [
  {
    name: 'GFT',
    firm: 'Global Forex Trading',
    country: 'International',
    yearsInOperation: 8,
    type: 'Prop Firm',
    assets: ['Forex', 'Indices', 'Commodities', 'Crypto'],
    platform: ['MT4', 'MT5', 'cTrader'],
    signupLink: 'https://gft.com/join',
    rating: 4.8,
    totalReviews: 500,
    programs: [
      {
        type: '1-Step Challenge',
        description: 'Complete 1 phase to get funded',
        timeLimit: { total: 30, unit: 'days' },
        rules: {
          profitTarget: 10,
          maxDrawdown: 6,
          dailyDrawdown: 4,
          minTradingDays: 0,
          weekendHolding: true,
          eaTrading: true,
          newsTrading: true
        },
        accountOptions: [
          { accountSize: 10000, price: 199, payoutPercentage: 80, maxAllocation: 20000 },
          { accountSize: 25000, price: 399, payoutPercentage: 80, maxAllocation: 50000 },
          { accountSize: 50000, price: 699, payoutPercentage: 85, maxAllocation: 100000 },
          { accountSize: 100000, price: 999, payoutPercentage: 85, maxAllocation: 200000 },
        ]
      },
      {
        type: '2-Step Challenge',
        description: 'Complete 2 phases to get funded',
        timeLimit: { phase1: 30, phase2: 30, unit: 'days' },
        rules: {
          profitTarget: { phase1: 8, phase2: 5, total: 13 },
          maxDrawdown: 8,
          dailyDrawdown: 5,
          minTradingDays: 5,
          weekendHolding: true,
          eaTrading: true,
          newsTrading: false
        },
        accountOptions: [
          { accountSize: 10000, price: 149, payoutPercentage: 75, maxAllocation: 20000 },
          { accountSize: 25000, price: 299, payoutPercentage: 75, maxAllocation: 50000 },
          { accountSize: 50000, price: 499, payoutPercentage: 80, maxAllocation: 100000 },
          { accountSize: 100000, price: 799, payoutPercentage: 80, maxAllocation: 200000 },
        ]
      }
    ]
  },
];

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('🌱 Starting database seeding with region fields...');
  
  // Clear existing data
  console.log('🗑️ Clearing existing data...');
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "brokers" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "prop_firms" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "broker_bonuses" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "broker_promotions" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "prop_firm_programs" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "prop_firm_promotions" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "broker_account_types" CASCADE;`;
    console.log('✅ Database cleared');
  } catch (error) {
    console.log('⚠️ Error clearing tables:', error);
  }
  
  console.log('🚀 Seeding brokers with regions...');
  
  // Seed Brokers
  for (const brokerData of brokersData) {
    try {
      const slug = generateSlug(brokerData.name);
      const regionData = BROKER_REGIONS[brokerData.name] || { regions: ['GLOBAL'], restrictedRegions: [] };
      
      const broker = await prisma.broker.create({
        data: {
          name: brokerData.name,
          slug: slug,
          status: "ACTIVE",
          description: brokerData.description || '',
          logo: brokerData.logo,
          website: brokerData.website || '#',
          founded: brokerData.founded,
          headquarters: brokerData.headquarters,
          type: brokerData.type || 'Broker',
          regulated: brokerData.regulated || false,
          minDeposit: brokerData.minDeposit,
          platforms: brokerData.platforms || [],
          features: brokerData.features || [],
          depositMethods: brokerData.depositMethods || [],
          withdrawalMethods: brokerData.withdrawalMethods || [],
          supportLanguages: brokerData.support?.languages || [],
          awards: brokerData.awards || [],
          targetAudience: brokerData.suitableFor || [],
          rating: brokerData.rating || 0,
          reviewsCount: brokerData.reviewsCount || 0,
          maxLeverage: brokerData.leverage,
          country: brokerData.country,
          yearsInOperation: brokerData.yearsInOperation,
          assets: brokerData.assets,
          signupLink: brokerData.signupLink,
          bonusOffer: brokerData.bonusOffer,
          // Region fields
          regions: regionData.regions,
          restrictedRegions: regionData.restrictedRegions,
        }
      });
      
      console.log(`✅ Created broker: ${broker.name} (ID: ${broker.id})`);
      console.log(`   ↳ Regions: ${regionData.regions.join(', ')}`);
      
    } catch (error) {
      console.error(`❌ Error creating broker ${brokerData.name}:`, error);
    }
  }
  
  console.log('🚀 Seeding prop firms with regions...');
  
  // Seed Prop Firms
  for (const firmData of propFirmsData) {
    try {
      const slug = generateSlug(firmData.name);
      const regionData = PROP_FIRM_REGIONS[firmData.name] || { regions: ['GLOBAL'], restrictedRegions: [] };
      
      const propFirm = await prisma.propFirm.create({
        data: {
          name: firmData.name,
          slug: slug,
          status: "ACTIVE",
          description: firmData.firm || `${firmData.name} is a prop firm`,
          website: firmData.signupLink || `https://${slug}.com`,
          headquarters: firmData.country || undefined,
          type: firmData.type || 'Prop Firm',
          platforms: firmData.platform || [],
          tradingInstruments: firmData.assets || [],
          rating: firmData.rating || 0,
          reviewsCount: firmData.totalReviews || 0,
          country: firmData.country,
          yearsInOperation: firmData.yearsInOperation,
          assets: firmData.assets || [],
          signupLink: firmData.signupLink,
          // Region fields
          regions: regionData.regions,
          restrictedRegions: regionData.restrictedRegions,
        }
      });
      
      console.log(`✅ Created prop firm: ${propFirm.name} (ID: ${propFirm.id})`);
      console.log(`   ↳ Regions: ${regionData.regions.join(', ')}`);
      
      // Create programs
      if (firmData.programs?.length) {
        for (const program of firmData.programs) {
          await prisma.propFirmProgram.create({
            data: {
              name: program.type || 'Program',
              type: program.type || 'Unknown',
              description: program.description || '',
              timeLimit: program.timeLimit ? JSON.stringify(program.timeLimit) : undefined,
              rules: program.rules ? JSON.stringify(program.rules) : undefined,
              accountOptions: program.accountOptions ? JSON.stringify(program.accountOptions) : undefined,
              propFirmId: propFirm.id
            }
          });
        }
        console.log(`   ↳ Created ${firmData.programs.length} programs`);
      }
      
    } catch (error) {
      console.error(`❌ Error creating prop firm ${firmData.name}:`, error);
    }
  }
  
  const brokerCount = await prisma.broker.count();
  const propFirmCount = await prisma.propFirm.count();
  
  console.log('🎉 Seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Brokers in DB: ${brokerCount}`);
  console.log(`   - Prop Firms in DB: ${propFirmCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });