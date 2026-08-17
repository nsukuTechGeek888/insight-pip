export const brokersData = [
  {
    id: 1,
    name: "PrimeFX",
    // Basic Information
    description: "Award-winning broker with tight spreads and advanced trading tools",
    logo: "/brokers/primefx.png",
    founded: 2015,
    headquarters: "London, UK",
    website: "https://primefx.com",
    
    // Account Information
    accountTypes: [
      {
        name: "Standard",
        minDeposit: 100,
        commission: "No commission",
        spreadType: "Variable",
        swapFree: false
      },
      {
        name: "Pro",
        minDeposit: 500,
        commission: "$3 per lot",
        spreadType: "Raw spreads",
        swapFree: true
      },
      {
        name: "Islamic",
        minDeposit: 100,
        commission: "No commission",
        spreadType: "Variable",
        swapFree: true
      }
    ],
    demoAccount: true,
    demoAccountDuration: "30 days",
    
    // Trading Conditions
    leverage: "1:200",
    minTradeSize: 0.01,
    maxTradeSize: 100,
    orderExecution: "Market Execution",
    marginCall: 100,
    stopOutLevel: 50,
    
    // Spreads & Commissions
    spreads: {
      eurusd: "0.1 - 0.3",
      gbpusd: "0.2 - 0.4",
      usdjpy: "0.3 - 0.5",
      xauusd: "0.8 - 1.2",
      us30: "1.2 - 1.8"
    },
    commissions: {
      standard: "No commission",
      pro: "$3 per lot",
      ecn: "$2.5 per lot"
    },
    swapFree: true,
    
    // Platforms & Tools
    platforms: ["MT4", "MT5", "cTrader", "WebTrader", "Mobile App"],
    mobileTrading: true,
    chartingTools: ["Advanced charts", "Technical indicators", "Drawing tools", "Market analysis"],
    tradingFeatures: ["One-click trading", "Expert Advisors", "Copy trading", "Hedging allowed"],
    
    // Instruments
    instruments: {
      forex: 60,
      commodities: 15,
      indices: 12,
      stocks: 200,
      cryptocurrencies: 25,
      etfs: 30
    },
    
    // Deposits & Withdrawals
    depositMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller", "Crypto"],
    withdrawalMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller", "Crypto"],
    withdrawalProcessingTime: "1-3 business days",
    withdrawalFee: "No fee",
    minWithdrawal: 50,
    
    // Bonuses & Promotions
    bonuses: [
      {
        type: "Deposit Bonus",
        amount: "200%",
        conditions: "Available on first deposit only. Minimum deposit $100.",
        expiry: "Ongoing",
        code: "PRIME200"
      },
      {
        type: "No Deposit Bonus",
        amount: "$30",
        conditions: "For new clients only. Max profit withdrawal $200.",
        expiry: "Limited Time",
        code: "PRIME30"
      }
    ],
    promotions: ["Free VPS", "Trading contests", "Cashback program"],
    
    // Customer Support
    support: {
      languages: ["English", "Spanish", "German", "Arabic", "Chinese"],
      availability: "24/5",
      channels: ["Live Chat", "Email", "Phone", "WhatsApp"],
      responseTime: "Under 5 minutes (live chat)"
    },
    
    // Education & Research
    education: {
      learningMaterials: ["Video tutorials", "Webinars", "E-books", "Courses"],
      researchTools: ["Daily market analysis", "Economic calendar", "Trading signals", "Market news"]
    },
    
    // Regulation & Safety
    regulation: {
      authorities: ["FCA (UK)", "CySEC (Cyprus)", "ASIC (Australia)"],
      compensationScheme: "Up to £85,000",
      negativeBalanceProtection: true,
      segregatedAccounts: true
    },
    
    // Reviews & Ratings
    rating: 4.5,
    reviewsCount: 128,
    reviewHighlights: {
      tradingConditions: 4.7,
      platformStability: 4.8,
      customerSupport: 4.6,
      withdrawalSpeed: 4.5,
      education: 4.4
    },
    
    // Additional Info
    awards: ["Best Forex Broker 2022", "Most Innovative Platform 2021"],
    partnershipProgram: true,
    affiliateProgram: true,
    ibProgram: true,
    
    // Special Features
    features: [
      "Negative balance protection",
      "Advanced charting tools",
      "Free VPS for high-volume traders",
      "Copy trading platform",
      "Economic calendar integration"
    ],
    
    // Target Audience
    suitableFor: ["Beginners", "Advanced traders", "Scalpers", "EA traders"],
    
    // Additional Fields
    socialMedia: {
      twitter: "https://twitter.com/primefx",
      facebook: "https://facebook.com/primefx",
      youtube: "https://youtube.com/primefx",
      linkedin: "https://linkedin.com/company/primefx"
    },
    
    // Original fields (maintained for backward compatibility)
    bonusOffer: "200% Deposit Bonus",
    bonus: "200% Deposit Bonus",
    highlight: "Best for Tight Spreads",
    signupLink: "https://primefx.com/signup",
    payout: 90,
    accountSize: 50000,
    country: "UK",
    maxAllocation: 100000,
    yearsInOperation: 8,
    years: 8,
    type: "Broker",
    assets: "Forex, Stocks, Commodities, Indices, Cryptocurrencies, ETFs",
    platform: ["MT4", "MT5", "cTrader", "WebTrader"],
    programType: ["Standard", "Pro", "ECN"],
    promo: "Free VPS",
    regulated: true,
    minDeposit: 100
  },
  {
    id: 2,
    name: "EagleTrade",
    // Basic Information
    description: "Regulated broker with competitive pricing and excellent customer service",
    logo: "/brokers/eagletrade.png",
    founded: 2012,
    headquarters: "Toronto, Canada",
    website: "https://eagletrade.com",
    
    // Account Information
    accountTypes: [
      {
        name: "Basic",
        minDeposit: 50,
        commission: "No commission",
        spreadType: "Fixed",
        swapFree: false
      },
      {
        name: "Advanced",
        minDeposit: 250,
        commission: "$2.5 per lot",
        spreadType: "Variable",
        swapFree: true
      }
    ],
    demoAccount: true,
    demoAccountDuration: "Unlimited",
    
    // Trading Conditions
    leverage: "1:500",
    minTradeSize: 0.01,
    maxTradeSize: 50,
    orderExecution: "Instant Execution",
    marginCall: 80,
    stopOutLevel: 40,
    
    // Spreads & Commissions
    spreads: {
      eurusd: "0.2 - 0.4",
      gbpusd: "0.3 - 0.5",
      usdjpy: "0.4 - 0.6",
      xauusd: "1.0 - 1.5",
      us30: "1.5 - 2.0"
    },
    commissions: {
      basic: "No commission",
      advanced: "$2.5 per lot"
    },
    swapFree: true,
    
    // Platforms & Tools
    platforms: ["MT4", "MT5", "TradingView", "WebTrader", "Mobile App"],
    mobileTrading: true,
    chartingTools: ["Basic charts", "Technical indicators", "Market analysis"],
    tradingFeatures: ["One-click trading", "Expert Advisors", "Hedging allowed"],
    
    // Instruments
    instruments: {
      forex: 45,
      commodities: 10,
      indices: 8,
      stocks: 150,
      cryptocurrencies: 15,
      etfs: 20
    },
    
    // Deposits & Withdrawals
    depositMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller"],
    withdrawalMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller"],
    withdrawalProcessingTime: "1-5 business days",
    withdrawalFee: "$10 for bank transfer",
    minWithdrawal: 25,
    
    // Bonuses & Promotions
    bonuses: [
      {
        type: "No Deposit Bonus",
        amount: "$50",
        conditions: "Only for new registrations. Withdrawal conditions apply.",
        expiry: "Ongoing",
        code: "EAGLE50"
      },
      {
        type: "Deposit Bonus",
        amount: "100%",
        conditions: "Matched on first deposit up to $500.",
        expiry: "Limited Time",
        code: "EAGLE100"
      }
    ],
    promotions: ["Cashback program", "Trading contests"],
    
    // Customer Support
    support: {
      languages: ["English", "French", "Spanish"],
      availability: "24/5",
      channels: ["Live Chat", "Email", "Phone"],
      responseTime: "Under 10 minutes (live chat)"
    },
    
    // Education & Research
    education: {
      learningMaterials: ["Video tutorials", "Webinars", "E-books"],
      researchTools: ["Market analysis", "Economic calendar", "Trading signals"]
    },
    
    // Regulation & Safety
    regulation: {
      authorities: ["IIROC (Canada)"],
      compensationScheme: "Up to $1,000,000",
      negativeBalanceProtection: true,
      segregatedAccounts: true
    },
    
    // Reviews & Ratings
    rating: 4.6,
    reviewsCount: 94,
    reviewHighlights: {
      tradingConditions: 4.5,
      platformStability: 4.4,
      customerSupport: 4.8,
      withdrawalSpeed: 4.5,
      education: 4.3
    },
    
    // Additional Info
    awards: ["Best Customer Service 2022"],
    partnershipProgram: true,
    affiliateProgram: true,
    ibProgram: false,
    
    // Special Features
    features: [
      "Negative balance protection",
      "Free educational resources",
      "Competitive spreads",
      "Multiple account options"
    ],
    
    // Target Audience
    suitableFor: ["Beginners", "Intermediate traders"],
    
    // Additional Fields
    socialMedia: {
      twitter: "https://twitter.com/eagletrade",
      facebook: "https://facebook.com/eagletrade",
      youtube: "https://youtube.com/eagletrade"
    },
    
    // Original fields (maintained for backward compatibility)
    bonusOffer: "$50 No Deposit Bonus",
    bonus: "$50 No Deposit Bonus",
    highlight: "Top Regulation Standards",
    signupLink: "https://eagletrade.com/signup",
    payout: 88,
    accountSize: 75000,
    country: "Canada",
    maxAllocation: 180000,
    yearsInOperation: 11,
    years: 11,
    type: "Broker",
    assets: "Forex, Commodities, Indices, Stocks, Cryptocurrencies",
    platform: ["MT4", "MT5", "TradingView"],
    programType: ["Basic", "Advanced"],
    promo: "Cashback program",
    spreads: {
      us30: "1.5",
      xauusd: "1.0",
      eurusd: "0.2"
    },
    regulated: true,
    minDeposit: 50
  },
  {
    id: 3,
    name: "SwiftMarkets",
    // Basic Information
    description: "Global broker offering advanced trading technology and competitive conditions",
    logo: "/brokers/swiftmarkets.png",
    founded: 2018,
    headquarters: "Sydney, Australia",
    website: "https://swiftmarkets.com",
    
    // Account Information
    accountTypes: [
      {
        name: "Standard",
        minDeposit: 200,
        commission: "No commission",
        spreadType: "Variable",
        swapFree: false
      },
      {
        name: "ECN",
        minDeposit: 1000,
        commission: "$2 per lot",
        spreadType: "Raw spreads",
        swapFree: true
      },
      {
        name: "VIP",
        minDeposit: 5000,
        commission: "$1.5 per lot",
        spreadType: "Raw spreads",
        swapFree: true
      }
    ],
    demoAccount: true,
    demoAccountDuration: "90 days",
    
    // Trading Conditions
    leverage: "1:500",
    minTradeSize: 0.01,
    maxTradeSize: 100,
    orderExecution: "Market Execution",
    marginCall: 100,
    stopOutLevel: 50,
    
    // Spreads & Commissions
    spreads: {
      eurusd: "0.1 - 0.3",
      gbpusd: "0.2 - 0.4",
      usdjpy: "0.3 - 0.5",
      xauusd: "0.7 - 1.0",
      us30: "1.0 - 1.5"
    },
    commissions: {
      standard: "No commission",
      ecn: "$2 per lot",
      vip: "$1.5 per lot"
    },
    swapFree: true,
    
    // Platforms & Tools
    platforms: ["MT5", "cTrader", "WebTrader", "Mobile App", "TradingView"],
    mobileTrading: true,
    chartingTools: ["Advanced charts", "Technical indicators", "Drawing tools", "Market analysis", "Trading ideas"],
    tradingFeatures: ["One-click trading", "Expert Advisors", "Copy trading", "Hedging allowed", "Algorithmic trading"],
    
    // Instruments
    instruments: {
      forex: 70,
      commodities: 20,
      indices: 15,
      stocks: 300,
      cryptocurrencies: 35,
      etfs: 40,
      futures: 10
    },
    
    // Deposits & Withdrawals
    depositMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller", "Crypto", "PayPal"],
    withdrawalMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller", "Crypto", "PayPal"],
    withdrawalProcessingTime: "1-2 business days",
    withdrawalFee: "No fee",
    minWithdrawal: 50,
    
    // Bonuses & Promotions
    bonuses: [
      {
        type: "Deposit Bonus",
        amount: "100%",
        conditions: "Available on first deposit. Minimum deposit $200.",
        expiry: "Ongoing",
        code: "SWIFT100"
      }
    ],
    promotions: ["Free VPS for ECN accounts", "Trading contests", "Cashback program", "Referral program"],
    
    // Customer Support
    support: {
      languages: ["English", "Spanish", "German", "French", "Arabic", "Chinese"],
      availability: "24/5",
      channels: ["Live Chat", "Email", "Phone", "WhatsApp", "Telegram"],
      responseTime: "Under 3 minutes (live chat)"
    },
    
    // Education & Research
    education: {
      learningMaterials: ["Video tutorials", "Webinars", "E-books", "Courses", "Trading guides"],
      researchTools: ["Daily market analysis", "Economic calendar", "Trading signals", "Market news", "Autochartist"]
    },
    
    // Regulation & Safety
    regulation: {
      authorities: ["ASIC (Australia)", "FSA (Seychelles)"],
      compensationScheme: "Up to $100,000",
      negativeBalanceProtection: true,
      segregatedAccounts: true
    },
    
    // Reviews & Ratings
    rating: 4.4,
    reviewsCount: 102,
    reviewHighlights: {
      tradingConditions: 4.6,
      platformStability: 4.7,
      customerSupport: 4.5,
      withdrawalSpeed: 4.4,
      education: 4.6
    },
    
    // Additional Info
    awards: ["Best Trading Technology 2023", "Most Transparent Broker 2022"],
    partnershipProgram: true,
    affiliateProgram: true,
    ibProgram: true,
    
    // Special Features
    features: [
      "Negative balance protection",
      "Advanced charting tools",
      "Free VPS for ECN accounts",
      "Copy trading platform",
      "Economic calendar integration",
      "Autochartist integration"
    ],
    
    // Target Audience
    suitableFor: ["Intermediate traders", "Advanced traders", "EA traders", "Algorithmic traders"],
    
    // Additional Fields
    socialMedia: {
      twitter: "https://twitter.com/swiftmarkets",
      facebook: "https://facebook.com/swiftmarkets",
      youtube: "https://youtube.com/swiftmarkets",
      instagram: "https://instagram.com/swiftmarkets"
    },
    
    // Original fields (maintained for backward compatibility)
    bonusOffer: "100% Deposit Match",
    bonus: "100% Deposit Match",
    highlight: "Best for Advanced Tools",
    signupLink: "https://swiftmarkets.com/signup",
    payout: 87,
    accountSize: 60000,
    country: "Australia",
    maxAllocation: 120000,
    yearsInOperation: 5,
    years: 5,
    type: "Broker",
    assets: "Forex, Crypto, Commodities, Indices, Stocks, ETFs",
    platform: ["MT5", "MetaTrader Web", "cTrader"],
    programType: ["Standard", "ECN", "VIP"],
    promo: "No commission on trades",
    spreads: {
      us30: "1.0",
      xauusd: "0.7",
      eurusd: "0.15"
    },
    regulated: true,
    minDeposit: 200
  },
  {
    id: 4,
    name: "Nova Brokers",
    // Basic Information
    description: "Innovative broker with social trading features and zero fees",
    logo: "/brokers/novabrokers.png",
    founded: 2016,
    headquarters: "Vancouver, Canada",
    website: "https://novabrokers.com",
    
    // Account Information
    accountTypes: [
      {
        name: "Starter",
        minDeposit: 100,
        commission: "No commission",
        spreadType: "Fixed",
        swapFree: false
      },
      {
        name: "Advanced",
        minDeposit: 500,
        commission: "$2 per lot",
        spreadType: "Variable",
        swapFree: true
      },
      {
        name: "Professional",
        minDeposit: 2000,
        commission: "$1 per lot",
        spreadType: "Raw spreads",
        swapFree: true
      }
    ],
    demoAccount: true,
    demoAccountDuration: "30 days",
    
    // Trading Conditions
    leverage: "1:400",
    minTradeSize: 0.01,
    maxTradeSize: 50,
    orderExecution: "Instant Execution",
    marginCall: 80,
    stopOutLevel: 40,
    
    // Spreads & Commissions
    spreads: {
      eurusd: "0.3 - 0.5",
      gbpusd: "0.4 - 0.6",
      usdjpy: "0.5 - 0.7",
      xauusd: "1.2 - 1.8",
      us30: "1.8 - 2.5"
    },
    commissions: {
      starter: "No commission",
      advanced: "$2 per lot",
      professional: "$1 per lot"
    },
    swapFree: true,
    
    // Platforms & Tools
    platforms: ["MT4", "WebTrader", "Mobile App", "Social Trading Platform"],
    mobileTrading: true,
    chartingTools: ["Basic charts", "Technical indicators", "Social trading features"],
    tradingFeatures: ["One-click trading", "Social trading", "Copy trading", "Hedging allowed"],
    
    // Instruments
    instruments: {
      forex: 50,
      commodities: 12,
      indices: 10,
      stocks: 180,
      cryptocurrencies: 20,
      etfs: 25
    },
    
    // Deposits & Withdrawals
    depositMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller", "PayPal"],
    withdrawalMethods: ["Credit/Debit Card", "Bank Transfer", "Skrill", "Neteller", "PayPal"],
    withdrawalProcessingTime: "2-4 business days",
    withdrawalFee: "No fee",
    minWithdrawal: 50,
    
    // Bonuses & Promotions
    bonuses: [
      {
        type: "Reload Bonus",
        amount: "30%",
        conditions: "Applies on every redeposit. No cap.",
        expiry: "Ongoing",
        code: "NOVA30"
      }
    ],
    promotions: ["Social trading contests", "Cashback program", "Referral program"],
    
    // Customer Support
    support: {
      languages: ["English", "French", "Spanish"],
      availability: "24/5",
      channels: ["Live Chat", "Email", "Phone"],
      responseTime: "Under 15 minutes (live chat)"
    },
    
    // Education & Research
    education: {
      learningMaterials: ["Video tutorials", "Webinars", "Trading guides"],
      researchTools: ["Market analysis", "Economic calendar", "Social trading signals"]
    },
    
    // Regulation & Safety
    regulation: {
      authorities: ["IIROC (Canada)"],
      compensationScheme: "Up to $1,000,000",
      negativeBalanceProtection: true,
      segregatedAccounts: true
    },
    
    // Reviews & Ratings
    rating: 4.7,
    reviewsCount: 110,
    reviewHighlights: {
      tradingConditions: 4.8,
      platformStability: 4.7,
      customerSupport: 4.6,
      withdrawalSpeed: 4.5,
      education: 4.3
    },
    
    // Additional Info
    awards: ["Best Social Trading Platform 2023"],
    partnershipProgram: true,
    affiliateProgram: true,
    ibProgram: true,
    
    // Special Features
    features: [
      "Negative balance protection",
      "Social trading platform",
      "Zero withdrawal fees",
      "Copy trading features",
      "Community trading signals"
    ],
    
    // Target Audience
    suitableFor: ["Beginners", "Social traders", "Copy traders"],
    
    // Additional Fields
    socialMedia: {
      twitter: "https://twitter.com/novabrokers",
      facebook: "https://facebook.com/novabrokers",
      youtube: "https://youtube.com/novabrokers"
    },
    
    // Original fields (maintained for backward compatibility)
    bonusOffer: "30% Reload Bonus",
    bonus: "30% Reload Bonus",
    highlight: "Zero Fees on Withdrawals",
    signupLink: "https://novabrokers.com/signup",
    payout: 88,
    accountSize: 75000,
    country: "Canada",
    maxAllocation: 180000,
    yearsInOperation: 7,
    years: 7,
    type: "Broker",
    assets: "Forex, Commodities, Indices, Stocks, Cryptocurrencies",
    platform: ["MT4", "MetaTrader Web", "Social Platform"],
    programType: ["Starter", "Advanced", "Professional"],
    promo: "Cashback program",
    spreads: {
      us30: "1.3",
      xauusd: "0.9",
      eurusd: "0.25"
    },
    regulated: true,
    minDeposit: 100
  }
];