// src/lib/propFirms.ts
export const propFirms = [
  {
    id: 1,
    name: "Alpha Capital",
    payout: 85,
    leverage: "1:100",
    rating: 4.8,
    accountSize: 100000,
    country: "USA",
    yearsInOperation: 4,
    assets: ["fx", "crypto", "indices"],
    platform: ["MT4", "TradingView"],
    maxAllocation: 2000000,
    promo: "🎁 10% Off",
    type: "Prop Firm",
    programType: ["2 Step"],
  },
  {
    id: 2,
    name: "Titan Funding",
    payout: 80,
    leverage: "1:50",
    rating: 4.6,
    accountSize: 50000,
    country: "UK",
    yearsInOperation: 3,
    assets: ["fx", "commodities"],
    platform: ["cTrader"],
    maxAllocation: 1000000,
    promo: "None",
    type: "Prop Firm",
    programType: ["1 Step"],
  },
];

// src/lib/brokers.ts
export const brokers = [
  {
    id: 1,
    name: "Blueberry Markets",
    rating: 4.7,
    country: "Australia",
    yearsInOperation: 6,
    regulated: true,
    minDeposit: 100,
    spreads: {
      us30: "1.2",
      xauusd: "0.8",
      eurusd: "0.3",
    },
    type: "Broker",
  },
  {
    id: 2,
    name: "IC Markets",
    rating: 4.9,
    country: "Australia",
    yearsInOperation: 10,
    regulated: true,
    minDeposit: 200,
    spreads: {
      us30: "1.0",
      xauusd: "0.7",
      eurusd: "0.1",
    },
    type: "Broker",
  },
];
