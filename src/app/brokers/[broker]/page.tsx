// app/brokers/[broker]/page.tsx - UPDATED WITH REGION CHECK

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import { useRegion } from '@/contexts/RegionContext';
import { useUser } from '@/contexts/UserContext';
import BrokerPage from './DesktopBrokerPage';
import MobileBrokerDetail from '@/components/brokers/MobileBrokerDetail';
import NotAvailableInRegion from '@/components/NotAvailableInRegion';
import { BreadcrumbSchema } from '@/components/StructuredData';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default function BrokerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { region, isLoading: regionLoading } = useRegion();
  const { user } = useUser();
  
  const [mounted, setMounted] = useState(false);
  const [broker, setBroker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notAvailable, setNotAvailable] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableRegionNames, setAvailableRegionNames] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  
  const brokerSlug = params.broker as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch broker data with region
  useEffect(() => {
    const fetchBroker = async () => {
      if (!brokerSlug || regionLoading) return;
      
      try {
        setLoading(true);
        setNotAvailable(false);
        
        // Fetch broker with region context
        const response = await fetch(`/api/brokers/slug/${brokerSlug}?region=${region}`);
        const data = await response.json();
        
        if (data.success) {
          setBroker(data.data);
        } else if (data.error === 'NOT_AVAILABLE_IN_REGION') {
          setNotAvailable(true);
          setAvailableRegions(data.availableRegions || []);
          setAvailableRegionNames(data.availableRegionNames || []);
          
          // Fetch alternatives
          try {
            const altResponse = await fetch(`/api/brokers?region=${region}&limit=5`);
            const altData = await altResponse.json();
            if (altData.success) {
              // Filter out the current broker
              const filtered = altData.data.filter((b: any) => b.slug !== brokerSlug);
              setAlternatives(filtered.slice(0, 4));
            }
          } catch (altError) {
            console.error('Error fetching alternatives:', altError);
          }
        } else {
          setBroker(null);
        }
      } catch (error) {
        console.error('Error fetching broker:', error);
        setBroker(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBroker();
  }, [brokerSlug, region, regionLoading]);

  if (!mounted || loading || regionLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Loading broker details...</p>
        </div>
      </div>
    );
  }

  // Show Not Available page
  if (notAvailable) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <NotAvailableInRegion
          entityName={brokerSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          entityType="broker"
          region={region}
          availableRegions={availableRegions}
          availableRegionNames={availableRegionNames}
          alternatives={alternatives}
          onViewAlternatives={() => router.push('/brokers')}
        />
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Broker not found</h1>
          <p className="text-zinc-400 mb-4">The broker you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/brokers')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
          >
            Browse Brokers
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Brokers', url: '/brokers' },
    { name: broker.name, url: `/brokers/${brokerSlug}` },
  ];

  const pageTitle = `${broker.name} Review - Compare Forex Brokers | InsightPip`;
  const pageDescription = broker.shortDescription || `Read real trader reviews for ${broker.name}. Compare spreads, leverage, regulation, and trust scores.`;
  const ogImage = broker.logo || 'https://insightpip.com/images/og-image.png';
  const ogUrl = `https://insightpip.com/brokers/${brokerSlug}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={ogUrl} />
        
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:site_name" content="InsightPip" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@insightpip" />
        
        <meta property="product:brand" content={broker.name} />
        <meta property="product:availability" content="in stock" />
      </Head>

      <BreadcrumbSchema items={breadcrumbItems} />
      
      {isMobile ? (
        <MobileBrokerDetail params={{ broker: brokerSlug }} />
      ) : (
        <BrokerPage params={Promise.resolve({ broker: brokerSlug })} />
      )}
    </>
  );
}