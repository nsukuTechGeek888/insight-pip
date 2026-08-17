# Project Tree - Insight-Pip

Accurate project structure for Insight-Pip Next.js application.

.
├── Configuration Files
│   ├── .env
│   ├── .gitignore
│   ├── .vercel/
│   │   ├── project.json
│   │   └── README.txt
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── next.config.ts
│   ├── eslint.config.mjs
│   ├── postcss.config.js
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   ├── next-env.d.ts
│   ├── README.md
│   ├── PROJECT_TREE.md
│   ├── project-tree.txt
│   └── test.http
├── prisma/
│   └── schema.prisma
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── favicon.ico
    │   ├── ClientLayout.tsx
    │   ├── ClientRootLayout.tsx
    │   ├── DesktopHome.tsx
    │   ├── account/
    │   │   └── page.tsx
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── route.ts
    │   │   │   ├── logout/
    │   │   │   │   └── route.ts
    │   │   │   ├── me/
    │   │   │   │   └── route.ts
    │   │   │   └── register/
    │   │   │       └── route.ts
    │   │   ├── currency-converter/
    │   │   │   └── route.js
    │   │   └── economic-calendar/
    │   │       └── route.js
    │   ├── blog/
    │   │   ├── page.tsx
    │   │   ├── DesktopBlogPage.tsx
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── brokers/
    │   │   ├── page.tsx
    │   │   ├── DesktopBrokersPage.tsx
    │   │   ├── BonusesTab.tsx
    │   │   ├── ReviewsTab.tsx
    │   │   ├── RegulationsTab.tsx
    │   │   ├── [broker]/
    │   │   │   ├── layout.tsx
    │   │   │   └── page.tsx
    │   │   └── tools/
    │   │       ├── DesktopToolsTab.tsx
    │   │       ├── PipCalculator.tsx
    │   │       ├── PremiumEconomicCalendar.tsx
    │   │       ├── RealCurrencyConverter.tsx
    │   │       └── RiskManagerPro.tsx
    │   ├── compare/
    │   │   ├── page.tsx
    │   │   └── DesktopCompare.tsx
    │   ├── economic-calendar/
    │   │   ├── layout.jsx
    │   │   └── page.jsx
    │   ├── login/
    │   │   ├── page.tsx
    │   │   └── DesktopLogin.tsx
    │   ├── mobile-login/
    │   │   └── page.tsx
    │   ├── offers/
    │   │   ├── page.tsx
    │   │   └── DesktopOffers.tsx
    │   ├── prop-firms/
    │   │   ├── page.tsx
    │   │   ├── DesktopPropFirms.tsx
    │   │   ├── DesktopToolsTab.tsx
    │   │   ├── PipCalculator.tsx
    │   │   ├── PremiumEconomicCalendar.tsx
    │   │   ├── RealCurrencyConverter.tsx
    │   │   ├── ReviewsTab.tsx
    │   │   ├── EnhancedPositionSizer.tsx
    │   │   ├── RiskManagerPro.tsx
    │   │   ├── [firm]/
    │   │   │   ├── layout.tsx
    │   │   │   └── page.tsx
    │   │   └── reviews/
    │   │       └── [firms]/
    │   │           └── page.tsx
    │   ├── reviews/
    │   │   ├── page.tsx
    │   │   └── DesktopReviews.tsx
    │   ├── signup/
    │   │   └── page.tsx
    │   └── tools/
    │       └── page.tsx
    ├── components/
    │   ├── AdaptiveLayout.tsx
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── account/
    │   │   └── MobileAccountPage.tsx
    │   ├── auth/
    │   │   └── MobileLoginPage.tsx
    │   ├── blog/
    │   │   └── MobileBlogPage.tsx
    │   ├── brokers/
    │   │   ├── MobileBrokersPage.tsx
    │   │   ├── MobileReviewsTab.tsx
    │   │   └── MobileToolsTab.tsx
    │   ├── compare/
    │   │   └── MobileCompare.tsx
    │   ├── home/
    │   │   └── MobileHome.tsx
    │   ├── mobile/
    │   │   ├── MobileHeader.tsx
    │   │   ├── MobileLayout.tsx
    │   │   ├── BottomNavigation.tsx
    │   │   └── ToolsPage.tsx
    │   ├── offers/
    │   │   └── MobileOffers.tsx
    │   ├── prop-firms/
    │   │   ├── MobilePropFirms.tsx
    │   │   ├── MobileReviewsTab.tsx
    │   │   └── MobileToolsTab.tsx
    │   ├── reviews/
    │   │   └── MobileReviews.tsx
    │   └── ui/
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── checkbox.tsx
    │       ├── input.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── switch.tsx
    │       ├── textarea.tsx
    │       └── toggle.tsx
    ├── contexts/
    │   ├── NavigationContext.tsx
    │   └── UserContext.tsx
    │
    ├── Data/
    │   ├── brokersData.ts
    │   └── challengesData.ts
    │
    ├── hooks/
    │   └── useIsMobile.ts
    │
    └── lib/
        ├── aiProcessor.ts
        ├── blogData.ts
        ├── brokers.ts
        ├── data.ts
        ├── db.ts
        ├── propFirms.ts
        ├── slugify.ts
        └── utils.ts
