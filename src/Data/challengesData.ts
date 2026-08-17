// Data/challengesData.ts
export const challengesData = [
  {
    id: 1,
    name: 'Alpha Capital',
    firm: 'Alpha Capital',
    rating: 4.8,
    country: 'USA',
    yearsInOperation: 5,
    type: 'Prop Firm',
    assets: ['Forex', 'Crypto', 'Indices', 'Commodities'],
    platform: ['MT5', 'MetaTrader Web', 'cTrader'],
    programs: [
      {
        type: 'Instant Funding',
        description: 'Start trading immediately with no evaluation phase',
        timeLimit: null,
        rules: {
          dailyDrawdown: 5,
          maxDrawdown: 10,
          profitTarget: 10,
          minTradingDays: 0,
          weekendHolding: true,
          newsTrading: 'restricted',
          eaTrading: true,
          consistencyRule: 'No specific consistency rule'
        },
        accountOptions: [
          {
            accountSize: 10000,
            price: 99,
            leverage: '1:30',
            payoutPercentage: 80,
            profitTarget: '10%',
            maxAllocation: 40000,
            popular: false,
            scalingPlan: 'Yes - up to $2M'
          },
          {
            accountSize: 25000,
            price: 189,
            leverage: '1:50',
            payoutPercentage: 82,
            profitTarget: '10%',
            maxAllocation: 100000,
            popular: false,
            scalingPlan: 'Yes - up to $2M'
          }
        ]
      },
      {
        type: '1-Step Evaluation',
        description: 'Single phase evaluation to get funded',
        timeLimit: {
          total: 30,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 5,
          maxDrawdown: 10,
          profitTarget: 10,
          minTradingDays: 5,
          weekendHolding: false,
          newsTrading: false,
          eaTrading: true,
          consistencyRule: 'Follow basic trading plan'
        },
        accountOptions: [
          {
            accountSize: 50000,
            price: 299,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '10%',
            maxAllocation: 200000,
            popular: true,
            scalingPlan: 'Yes - up to $2M'
          },
          {
            accountSize: 100000,
            price: 499,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '10%',
            maxAllocation: 400000,
            popular: false,
            scalingPlan: 'Yes - up to $2M'
          }
        ]
      },
      {
        type: '2-Step Evaluation',
        description: 'Two-phase evaluation process',
        timeLimit: {
          phase1: 30,
          phase2: 60,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 5,
          maxDrawdown: 10,
          profitTarget: {
            phase1: 8,
            phase2: 5
          },
          minTradingDays: 5,
          weekendHolding: false,
          newsTrading: false,
          eaTrading: true,
          consistencyRule: 'Maintain consistent trading strategy'
        },
        accountOptions: [
          {
            accountSize: 200000,
            price: 899,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '8% + 5%',
            maxAllocation: 800000,
            popular: false,
            scalingPlan: 'Yes - up to $2M'
          }
        ]
      }
    ],
    promotions: [
      {
        name: 'Limited Time Discount',
        description: '15% off on all evaluation accounts',
        code: 'SAVE15',
        validUntil: '2024-12-31'
      },
      {
        name: 'Free Retry',
        description: 'Get one free retry if you fail your first challenge',
        code: 'RETRYFREE',
        validUntil: '2024-12-31'
      }
    ],
    signupLink: 'https://alphacapital.com/signup',
    payoutFrequency: 'weekly',
    payoutMethods: ['Bank Transfer', 'Crypto', 'Skrill', 'Neteller'],
    minimumPayout: 100,
    newsTradingRestrictions: 'Restricted during high impact news',
    tradingInstruments: ['Forex Majors', 'Forex Minors', 'Cryptos', 'Indices', 'Commodities'],
    scalingPlan: {
      available: true,
      description: 'Increase account size by 25% every 3 months of consistent profitability',
      maxSize: 2000000
    },
    leverageOptions: {
      forex: '1:100',
      crypto: '1:10',
      indices: '1:50',
      commodities: '1:50'
    },
    spreads: {
      eurusd: '0.1 - 0.3 pips',
      xauusd: '0.25 - 0.5 pips',
      btceur: '0.01 - 0.05%'
    },
    commissions: {
      forex: 3,
      stocks: 0.01,
      crypto: 0.05,
      commissionUnit: {
        forex: 'per lot',
        stocks: 'per share',
        crypto: 'percentage'
      }
    },
    platformFees: 0,
    customerSupport: ['24/7 Live Chat', 'Email', 'Phone'],
    educationResources: ['Trading Courses', 'Webinars', 'Mentorship'],
    communityFeatures: ['Traders Discord', 'Copy Trading', 'Performance Analytics'],
    trustpilotRating: 4.7,
    trustpilotReviews: 1247,
    founded: 2019,
    regulation: 'Financial Commission',
    minimumAge: 18,
    supportedCountries: ['Worldwide'],
    prohibitedCountries: ['USA', 'Canada', 'Iran', 'North Korea'],
    tradingConditions: 4.9,
    customerCare: 4.8,
    userFriendliness: 4.7,
    payoutProcess: 4.9,
    totalReviews: 312
  },
  {
    id: 3,
    name: 'Quantum Prop',
    firm: 'Quantum Prop',
    rating: 4.2,
    country: 'Germany',
    yearsInOperation: 4,
    type: 'Prop Firm',
    assets: ['Crypto', 'Indices', 'Forex'],
    platform: ['TradeLocker', 'Match Trader', 'MT5'],
    programs: [
      {
        type: 'Instant Funding',
        description: 'Start trading immediately with funded capital',
        timeLimit: null,
        rules: {
          dailyDrawdown: 4,
          maxDrawdown: 8,
          profitTarget: 5,
          minTradingDays: 0,
          weekendHolding: true,
          newsTrading: true,
          eaTrading: true,
          consistencyRule: 'No specific consistency rule'
        },
        accountOptions: [
          {
            accountSize: 5000,
            price: 49,
            leverage: '1:10',
            payoutPercentage: 75,
            profitTarget: '5%',
            maxAllocation: 15000,
            popular: false,
            scalingPlan: 'Yes - up to $500K'
          },
          {
            accountSize: 10000,
            price: 89,
            leverage: '1:20',
            payoutPercentage: 78,
            profitTarget: '5%',
            maxAllocation: 30000,
            popular: false,
            scalingPlan: 'Yes - up to $500K'
          }
        ]
      },
      {
        type: '4-Step Evaluation',
        description: 'Comprehensive 4-phase evaluation process',
        timeLimit: {
          total: 90,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 4,
          maxDrawdown: 8,
          profitTarget: 5,
          minTradingDays: 10,
          weekendHolding: false,
          newsTrading: false,
          eaTrading: 'restricted',
          consistencyRule: 'Maintain consistent trading approach'
        },
        accountOptions: [
          {
            accountSize: 25000,
            price: 179,
            leverage: '1:30',
            payoutPercentage: 80,
            profitTarget: '5% each phase',
            maxAllocation: 75000,
            popular: true,
            scalingPlan: 'Yes - up to $500K'
          },
          {
            accountSize: 50000,
            price: 329,
            leverage: '1:50',
            payoutPercentage: 80,
            profitTarget: '5% each phase',
            maxAllocation: 150000,
            popular: false,
            scalingPlan: 'Yes - up to $500K'
          }
        ]
      }
    ],
    promotions: [
      {
        name: 'No Commission',
        description: 'No commission on trades for first month',
        code: 'NOCOMM',
        validUntil: '2024-12-31'
      }
    ],
    signupLink: 'https://quantumprop.com/join',
    payoutFrequency: 'bi-weekly',
    payoutMethods: ['Bank Transfer', 'Crypto', 'PayPal'],
    minimumPayout: 50,
    newsTradingRestrictions: 'Allowed with risk management',
    tradingInstruments: ['Cryptocurrencies', 'Forex', 'Indices'],
    scalingPlan: {
      available: true,
      description: 'Grow your account by 15% every quarter based on performance',
      maxSize: 500000
    },
    leverageOptions: {
      forex: '1:30',
      crypto: '1:5',
      indices: '1:20'
    },
    spreads: {
      eurusd: '0.2 - 0.5 pips',
      xauusd: '0.3 - 0.8 pips',
      btceur: '0.08 - 0.15%'
    },
    commissions: {
      forex: 4,
      crypto: 0.08,
      commissionUnit: {
        forex: 'per lot',
        crypto: 'percentage'
      }
    },
    platformFees: 10,
    customerSupport: ['24/5 Live Chat', 'Email'],
    educationResources: ['Trading Guides', 'Video Tutorials'],
    communityFeatures: ['Traders Forum', 'Performance Dashboard'],
    trustpilotRating: 4.3,
    trustpilotReviews: 856,
    founded: 2020,
    regulation: 'Internationally regulated',
    minimumAge: 21,
    supportedCountries: ['EU', 'UK', 'Australia', 'Asia'],
    prohibitedCountries: ['USA', 'Canada', 'Japan'],
    tradingConditions: 4.7,
    customerCare: 4.6,
    userFriendliness: 4.8,
    payoutProcess: 4.7,
    totalReviews: 245
  },
  {
    id: 7,
    name: 'Alpha Funded',
    firm: 'Alpha Funded',
    rating: 4.9,
    country: 'USA',
    yearsInOperation: 4,
    type: 'Prop Firm',
    assets: ['Forex', 'Crypto', 'Stocks', 'Commodities'],
    platform: ['MT5', 'MetaTrader Web', 'TradingView'],
    programs: [
      {
        type: '2-Step Evaluation',
        description: 'Standard two-step evaluation process',
        timeLimit: {
          phase1: 30,
          phase2: 60,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 6,
          maxDrawdown: 12,
          profitTarget: {
            phase1: 8,
            phase2: 5
          },
          minTradingDays: 5,
          weekendHolding: false,
          newsTrading: false,
          eaTrading: true,
          consistencyRule: 'Maintain consistent trading strategy'
        },
        accountOptions: [
          {
            accountSize: 15000,
            price: 129,
            leverage: '1:50',
            payoutPercentage: 80,
            profitTarget: '8% + 5%',
            maxAllocation: 60000,
            popular: false,
            scalingPlan: 'Yes - up to $1M'
          },
          {
            accountSize: 30000,
            price: 229,
            leverage: '1:100',
            payoutPercentage: 83,
            profitTarget: '8% + 5%',
            maxAllocation: 120000,
            popular: false,
            scalingPlan: 'Yes - up to $1M'
          }
        ]
      },
      {
        type: 'Instant Funding',
        description: 'Begin trading with capital immediately',
        timeLimit: null,
        rules: {
          dailyDrawdown: 6,
          maxDrawdown: 12,
          profitTarget: 10,
          minTradingDays: 0,
          weekendHolding: true,
          newsTrading: 'restricted',
          eaTrading: true,
          consistencyRule: 'No specific consistency rule'
        },
        accountOptions: [
          {
            accountSize: 50000,
            price: 349,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '10%',
            maxAllocation: 200000,
            popular: true,
            scalingPlan: 'Yes - up to $1M'
          },
          {
            accountSize: 100000,
            price: 599,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '10%',
            maxAllocation: 400000,
            popular: false,
            scalingPlan: 'Yes - up to $1M'
          },
          {
            accountSize: 200000,
            price: 1099,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '10%',
            maxAllocation: 800000,
            popular: false,
            scalingPlan: 'Yes - up to $1M'
          }
        ]
      }
    ],
    promotions: [
      {
        name: '10% Discount',
        description: '10% off on all challenges',
        code: 'ALPHA10',
        validUntil: '2024-12-31'
      }
    ],
    signupLink: 'https://alphafunded.com/register',
    payoutFrequency: 'weekly',
    payoutMethods: ['Bank Transfer', 'Crypto', 'Wire Transfer'],
    minimumPayout: 100,
    newsTradingRestrictions: 'Not allowed 15 minutes before/after high impact news',
    tradingInstruments: ['Forex', 'Cryptocurrencies', 'Stocks', 'Commodities', 'ETFs'],
    scalingPlan: {
      available: true,
      description: 'Scale up to 100% of initial account size every 6 months',
      maxSize: 1000000
    },
    leverageOptions: {
      forex: '1:100',
      crypto: '1:10',
      stocks: '1:5',
      commodities: '1:50'
    },
    spreads: {
      eurusd: '0.0 - 0.2 pips',
      xauusd: '0.15 - 0.35 pips',
      btceur: '0.02 - 0.08%'
    },
    commissions: {
      forex: 2.5,
      stocks: 0.005,
      crypto: 0.03,
      commissionUnit: {
        forex: 'per lot',
        stocks: 'per share',
        crypto: 'percentage'
      }
    },
    platformFees: 0,
    customerSupport: ['24/7 Live Chat', 'Email', 'Phone', 'WhatsApp'],
    educationResources: ['Comprehensive Course', 'Daily Analysis', '1-on-1 Mentoring'],
    communityFeatures: ['Trader Chat', 'Copy Trading', 'Advanced Analytics'],
    trustpilotRating: 4.8,
    trustpilotReviews: 1893,
    founded: 2020,
    regulation: 'Financial Services Authority',
    minimumAge: 18,
    supportedCountries: ['Worldwide'],
    prohibitedCountries: [],
    tradingConditions: 4.8,
    customerCare: 4.7,
    userFriendliness: 4.8,
    payoutProcess: 4.9,
    totalReviews: 198
  },
  {
    id: 8,
    name: 'Capital Surge',
    firm: 'Capital Surge',
    rating: 4.7,
    country: 'Canada',
    yearsInOperation: 6,
    type: 'Prop Firm',
    assets: ['Forex', 'Indices', 'Commodities', 'Crypto'],
    platform: ['cTrader', 'TradingView', 'MT5'],
    programs: [
      {
        type: '1-Step Evaluation',
        description: 'Simple one-step evaluation process',
        timeLimit: {
          total: 30,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 5,
          maxDrawdown: 15,
          profitTarget: 10,
          minTradingDays: 5,
          weekendHolding: false,
          newsTrading: false,
          eaTrading: true,
          consistencyRule: 'Follow basic trading plan'
        },
        accountOptions: [
          {
            accountSize: 25000,
            price: 199,
            leverage: '1:30',
            payoutPercentage: 85,
            profitTarget: '10%',
            maxAllocation: 75000,
            popular: false,
            scalingPlan: 'Yes - up to $1.5M'
          },
          {
            accountSize: 50000,
            price: 349,
            leverage: '1:50',
            payoutPercentage: 87,
            profitTarget: '10%',
            maxAllocation: 150000,
            popular: false,
            scalingPlan: 'Yes - up to $1.5M'
          }
        ]
      },
      {
        type: '2-Step Evaluation',
        description: 'Two-phase evaluation process',
        timeLimit: {
          phase1: 30,
          phase2: 60,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 5,
          maxDrawdown: 15,
          profitTarget: {
            phase1: 12,
            phase2: 5
          },
          minTradingDays: 5,
          weekendHolding: false,
          newsTrading: false,
          eaTrading: true,
          consistencyRule: 'Maintain consistent trading strategy'
        },
        accountOptions: [
          {
            accountSize: 100000,
            price: 599,
            leverage: '1:100',
            payoutPercentage: 90,
            profitTarget: '12% + 5%',
            maxAllocation: 300000,
            popular: true,
            scalingPlan: 'Yes - up to $1.5M'
          },
          {
            accountSize: 200000,
            price: 1099,
            leverage: '1:100',
            payoutPercentage: 90,
            profitTarget: '12% + 5%',
            maxAllocation: 600000,
            popular: false,
            scalingPlan: 'Yes - up to $1.5M'
          },
          {
            accountSize: 300000,
            price: 1499,
            leverage: '1:100',
            payoutPercentage: 90,
            profitTarget: '12% + 5%',
            maxAllocation: 900000,
            popular: false,
            scalingPlan: 'Yes - up to $1.5M'
          }
        ]
      }
    ],
    promotions: [
      {
        name: 'Double Funding',
        description: 'Double your account size upon successful evaluation',
        code: 'SURGE2X',
        validUntil: '2024-12-31'
      }
    ],
    signupLink: 'https://capitalsurge.com/signup',
    payoutFrequency: 'monthly',
    payoutMethods: ['Bank Transfer', 'Crypto', 'PayPal', 'Wire Transfer'],
    minimumPayout: 200,
    newsTradingRestrictions: 'Not allowed 30 minutes before/after high impact news',
    tradingInstruments: ['Forex', 'Indices', 'Commodities', 'Cryptocurrencies'],
    scalingPlan: {
      available: true,
      description: 'Double your account size every 6 months of profitable trading',
      maxSize: 1500000
    },
    leverageOptions: {
      forex: '1:100',
      crypto: '1:10',
      indices: '1:50',
      commodities: '1:50'
    },
    spreads: {
      eurusd: '0.1 - 0.4 pips',
      xauusd: '0.3 - 0.6 pips',
      btceur: '0.05 - 0.1%'
    },
    commissions: {
      forex: 3.5,
      crypto: 0.06,
      commissionUnit: {
        forex: 'per lot',
        crypto: 'percentage'
      }
    },
    platformFees: 0,
    customerSupport: ['24/7 Live Chat', 'Email', 'Phone'],
    educationResources: ['Video Tutorials', 'Market Analysis', 'Trading Strategies'],
    communityFeatures: ['Trader Community', 'Performance Tracking'],
    trustpilotRating: 4.6,
    trustpilotReviews: 932,
    founded: 2018,
    regulation: 'Canadian Financial Authorities',
    minimumAge: 19,
    supportedCountries: ['Worldwide'],
    prohibitedCountries: ['USA', 'Iran', 'North Korea', 'Syria'],
    tradingConditions: 4.6,
    customerCare: 4.5,
    userFriendliness: 4.7,
    payoutProcess: 4.8,
    totalReviews: 210
  },
  {
    id: 9,
    name: 'Elite Traders Fund',
    firm: 'Elite Traders Fund',
    rating: 4.6,
    country: 'UK',
    yearsInOperation: 3,
    type: 'Prop Firm',
    assets: ['Forex', 'Indices', 'Commodities'],
    platform: ['MT4', 'MT5', 'DXtrade'],
    programs: [
      {
        type: '1-Step Evaluation',
        description: 'Single phase evaluation process',
        timeLimit: {
          total: 30,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 4,
          maxDrawdown: 10,
          profitTarget: 8,
          minTradingDays: 5,
          weekendHolding: false,
          newsTrading: 'restricted',
          eaTrading: true,
          consistencyRule: 'Follow basic trading plan'
        },
        accountOptions: [
          {
            accountSize: 10000,
            price: 89,
            leverage: '1:30',
            payoutPercentage: 80,
            profitTarget: '8%',
            maxAllocation: 30000,
            popular: false,
            scalingPlan: 'Yes - up to $500K'
          },
          {
            accountSize: 25000,
            price: 189,
            leverage: '1:50',
            payoutPercentage: 82,
            profitTarget: '8%',
            maxAllocation: 75000,
            popular: false,
            scalingPlan: 'Yes - up to $500K'
          }
        ]
      },
      {
        type: '2-Step Evaluation',
        description: 'Two-phase evaluation process',
        timeLimit: {
          phase1: 30,
          phase2: 60,
          unit: 'days'
        },
        rules: {
          dailyDrawdown: 4,
          maxDrawdown: 10,
          profitTarget: {
            phase1: 10,
            phase2: 5
          },
          minTradingDays: 5,
          weekendHolding: false,
          newsTrading: 'restricted',
          eaTrading: true,
          consistencyRule: 'Maintain consistent trading strategy'
        },
        accountOptions: [
          {
            accountSize: 50000,
            price: 329,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '10% + 5%',
            maxAllocation: 150000,
            popular: true,
            scalingPlan: 'Yes - up to $500K'
          },
          {
            accountSize: 100000,
            price: 599,
            leverage: '1:100',
            payoutPercentage: 85,
            profitTarget: '10% + 5%',
            maxAllocation: 300000,
            popular: false,
            scalingPlan: 'Yes - up to $500K'
          }
        ]
      }
    ],
    promotions: [
      {
        name: 'Free Retry',
        description: 'Free retry on failed challenges',
        code: 'ELITE25',
        validUntil: '2024-12-31'
      },
      {
        name: '25% Discount',
        description: '25% off on all evaluation accounts',
        code: 'DISCOUNT25',
        validUntil: '2024-12-31'
      }
    ],
    signupLink: 'https://elitetradersfund.com/signup',
    payoutFrequency: 'bi-weekly',
    payoutMethods: ['Bank Transfer', 'Crypto', 'Skrill', 'Neteller'],
    minimumPayout: 100,
    newsTradingRestrictions: 'Restricted during high impact news events',
    tradingInstruments: ['Forex Majors', 'Forex Minors', 'Indices', 'Commodities'],
    scalingPlan: {
      available: true,
      description: 'Grow your account by 20% every 4 months of consistent profitability',
      maxSize: 500000
    },
    leverageOptions: {
      forex: '1:100',
      indices: '1:50',
      commodities: '1:50'
    },
    spreads: {
      eurusd: '0.2 - 0.5 pips',
      xauusd: '0.4 - 0.8 pips'
    },
    commissions: {
      forex: 4,
      commissionUnit: {
        forex: 'per lot'
      }
    },
    platformFees: 0,
    customerSupport: ['24/5 Live Chat', 'Email', 'Phone'],
    educationResources: ['Webinars', 'Trading Guides', 'Market Analysis'],
    communityFeatures: ['Trader Forum', 'Performance Analytics'],
    trustpilotRating: 4.5,
    trustpilotReviews: 678,
    founded: 2021,
    regulation: 'FCA Registered',
    minimumAge: 18,
    supportedCountries: ['UK', 'EU', 'Australia', 'New Zealand'],
    prohibitedCountries: ['USA', 'Canada', 'Japan'],
    tradingConditions: 4.5,
    customerCare: 4.7,
    userFriendliness: 4.6,
    payoutProcess: 4.5,
    totalReviews: 187
  }
];