// app/layout.tsx - UPDATED WITH REGION PROVIDER

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientRootLayout from "./ClientRootLayout";
import { Analytics } from "@vercel/analytics/react";
import { RegionProvider } from "@/contexts/RegionContext";

const inter = Inter({ subsets: ["latin"] });

// Site Configuration
const SITE_NAME = "InsightPip";
const SITE_DESCRIPTION = "Compare prop firms, forex brokers, and trading platforms with real trader reviews, trust scores, and verified payouts.";
const SITE_URL = "https://insightpip.com";
const OG_IMAGE = "https://insightpip.com/images/og-image.png";
const LOGO_PATH = "/images/insightpip-logo.png";
const TWITTER_HANDLE = "@insightpip";

const isProduction = process.env.NODE_ENV === 'production';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Compare Prop Firms & Forex Brokers | InsightPip",
    template: `%s | InsightPip`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "prop firms",
    "forex brokers",
    "trading reviews",
    "funded accounts",
    "prop trading",
    "forex trading",
    "broker comparison",
    "trusted brokers",
    "trading platforms",
    "forex broker reviews",
    "prop firm reviews",
  ],
  authors: [{ name: "InsightPip Team" }],
  creator: "InsightPip",
  publisher: "InsightPip",
  robots: {
    index: isProduction,
    follow: isProduction,
    googleBot: {
      index: isProduction,
      follow: isProduction,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Compare Prop Firms & Forex Brokers | InsightPip",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Find Your Trusted Trading Partner`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Prop Firms & Forex Brokers | InsightPip",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  category: "finance",
};

// JSON-LD Schemas
function JsonLdSchemas() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://insightpip.com/#organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}${LOGO_PATH}`,
      "width": 512,
      "height": 512,
    },
    "description": SITE_DESCRIPTION,
    "sameAs": [
      "https://twitter.com/insightpip",
      "https://linkedin.com/company/insightpip",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@insightpip.com",
      "contactType": "customer support",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://insightpip.com/#website",
    "url": SITE_URL,
    "name": SITE_NAME,
    "description": SITE_DESCRIPTION,
    "publisher": {
      "@type": "Organization",
      "@id": "https://insightpip.com/#organization",
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preconnect to critical third-party domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for API endpoints */}
        <link rel="dns-prefetch" href="/api" />
        
        {/* Sitemap Link */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        
        {/* JSON-LD Structured Data */}
        <JsonLdSchemas />
      </head>
      <body>
        <RegionProvider>
          <ClientRootLayout>{children}</ClientRootLayout>
        </RegionProvider>
        <Analytics />
      </body>
    </html>
  );
}