'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  Activity,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  ShieldCheck,
  Star,
  Trophy,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRegion } from '@/contexts/RegionContext';
import MobileLayout from '@/components/mobile/MobileLayout';

const T = {
  blue: '#2563EB',
  text: '#0A0E1A',
  muted: '#6B7280',
  soft: '#9CA3AF',
  border: '#E5E7EB',
  green: '#16A34A',
  amber: '#F59E0B',
  red: '#DC2626',
};

const REGION_DISPLAY: Record<string, { label: string; flag: string }> = {
  SA: { label: 'South Africa', flag: '🇿🇦' },
  EU: { label: 'Europe', flag: '🇪🇺' },
  UK: { label: 'United Kingdom', flag: '🇬🇧' },
  UAE: { label: 'UAE', flag: '🇦🇪' },
  KE: { label: 'Kenya', flag: '🇰🇪' },
  AU: { label: 'Australia', flag: '🇦🇺' },
  SG: { label: 'Singapore', flag: '🇸🇬' },
  US: { label: 'United States', flag: '🇺🇸' },
  CA: { label: 'Canada', flag: '🇨🇦' },
  GLOBAL: { label: 'Global', flag: '🌍' },
};

const incidentMap: Record<string, { label: string; color: string }> = {
  WITHDRAWAL_DELAY: { label: 'Withdrawal delay', color: T.amber },
  WITHDRAWAL_REJECTED: { label: 'Withdrawal rejected', color: T.red },
  SCAM_WARNING: { label: 'Scam warning', color: T.red },
  ACCOUNT_SUSPENDED: { label: 'Account suspended', color: T.red },
  WITHDRAWAL_PAID: { label: 'Withdrawal paid', color: T.green },
  PLATFORM_FREEZE: { label: 'Platform freeze', color: T.amber },
  SERVER_DOWN: { label: 'Server down', color: T.red },
  EXECUTION_DELAY: { label: 'Execution delay', color: T.amber },
};

function isAvailableInRegion(firm: any, region: string) {
  if (!firm) return false;
  if (firm.regions) {
    return firm.regions.includes(region) || firm.regions.includes('GLOBAL') || firm.regions.length === 0;
  }
  if (firm.region) return firm.region === region || firm.region === 'GLOBAL';
  return true;
}

function trustScore(reviews: any[]) {
  if (!reviews?.length) return { score: 0, count: 0 };
  const score = reviews.reduce((sum, review) => sum + (review.trustScore || 0), 0) / reviews.length;
  return { score: Math.round(score), count: reviews.length };
}

function Logo({ entity, large = false }: { entity: any; large?: boolean }) {
  return (
    <div className={large ? 'ip-logo-box ip-logo-box-large' : 'ip-logo-box'}>
      {entity?.logo ? (
        <img src={entity.logo} alt={entity.name || ''} className="ip-logo-img" />
      ) : (
        <span>{entity?.name?.charAt(0) || '?'}</span>
      )}
    </div>
  );
}

function TrustPill({ score }: { score: number }) {
  const color = score >= 80 ? T.green : score >= 60 ? T.amber : T.red;
  return (
    <span className="ip-trust-pill" style={{ color }}>
      <ShieldCheck size={12} />
      {score || '—'}
    </span>
  );
}

export default function MobileHome() {
  const router = useRouter();
  const { region } = useRegion();

  const [brokers, setBrokers] = useState<any[]>([]);
  const [propFirms, setPropFirms] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingTab, setRankingTab] = useState<'brokers' | 'propFirms'>('brokers');
  const [offerIndex, setOfferIndex] = useState(0);
  const [offerDirection, setOfferDirection] = useState(1);
  const [offerAnimating, setOfferAnimating] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const [brokerRes, propRes] = await Promise.all([
          api.getBrokers(region),
          api.getPropFirms(region),
        ]);

        if (!alive) return;
        setBrokers(brokerRes.success ? brokerRes.data || [] : []);
        setPropFirms(propRes.success ? propRes.data || [] : []);

        try {
          const res = await fetch('/api/incidents?limit=5');
          const data = await res.json();
          if (alive) setIncidents(data.incidents || []);
        } catch {}
      } catch (error) {
        console.error('Failed to load InsightPip homepage', error);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [region]);

  const enrichedBrokers = useMemo(
    () => brokers.map((broker) => ({ ...broker, trustScore: broker.trustScore || 0 })),
    [brokers]
  );
  const enrichedPropFirms = useMemo(
    () => propFirms.map((firm) => ({ ...firm, trustScore: firm.trustScore || 0 })),
    [propFirms]
  );

  const topBrokers = useMemo(
    () =>
      enrichedBrokers
        .filter((x) => isAvailableInRegion(x, region))
        .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0))
        .slice(0, 4),
    [enrichedBrokers, region]
  );

  const topPropFirms = useMemo(
    () =>
      enrichedPropFirms
        .filter((x) => isAvailableInRegion(x, region))
        .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0))
        .slice(0, 4),
    [enrichedPropFirms, region]
  );

  const offers = useMemo(() => {
    const brokerOffers = enrichedBrokers
      .filter((x) => (x.bonuses?.length || 0) > 0 || (x.promotions?.length || 0) > 0)
      .map((x) => ({ ...x, _type: 'broker' as const }));

    const propOffers = enrichedPropFirms
      .filter((x) => (x.promotions?.length || 0) > 0)
      .map((x) => ({ ...x, _type: 'prop' as const }));

    const mixed: any[] = [];
    const max = Math.max(brokerOffers.length, propOffers.length);
    for (let i = 0; i < max; i++) {
      if (brokerOffers[i]) mixed.push(brokerOffers[i]);
      if (propOffers[i]) mixed.push(propOffers[i]);
    }
    return mixed.slice(0, 6);
  }, [enrichedBrokers, enrichedPropFirms]);

  const currentOffer = offers[offerIndex] || null;
  const rankings = rankingTab === 'brokers' ? topBrokers : topPropFirms;

  const changeOffer = (direction: 1 | -1) => {
    if (offers.length < 2 || offerAnimating) return;
    setOfferAnimating(true);
    setOfferDirection(direction);
    window.setTimeout(() => {
      setOfferIndex((current) => (current + direction + offers.length) % offers.length);
      setOfferAnimating(false);
    }, 650);
  };

  useEffect(() => {
    if (offerIndex >= offers.length) setOfferIndex(0);
  }, [offers.length, offerIndex]);

  const getOfferCopy = (offer: any) => {
    const promotion = offer?.promotions?.[0];
    const bonus = offer?.bonuses?.[0];
    return {
      title: promotion?.name || bonus?.amount || bonus?.type || 'Exclusive offer',
      discount: promotion?.discount ? `${promotion.discount}% OFF` : '',
      expiry: promotion?.validUntil || bonus?.expiry || '',
    };
  };

  const navigateEntity = (entity: any, type: 'broker' | 'prop') => {
    router.push(type === 'broker'
      ? `/brokers/${entity.slug || entity.id}`
      : `/prop-firms/${entity.slug || entity.id}`);
  };

  if (loading) {
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="ip-home-loading">
          <div className="ip-loader" />
        </div>
      </MobileLayout>
    );
  }

  if (!brokers.length && !propFirms.length) {
    const info = REGION_DISPLAY[region] || REGION_DISPLAY.GLOBAL;
    return (
      <MobileLayout title="InsightPip" showSearch={false}>
        <div className="ip-empty">
          <Globe2 size={40} />
          <h2>No trading partners in {info.flag} {info.label}</h2>
          <p>We don't have brokers or prop firms available in this region yet.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="InsightPip" showSearch={false}>
      <main className="ip-home">
        {/* HERO */}
        <section className="ip-hero">
          <div className="ip-hero-copy">
            <div className="ip-eyebrow">REAL DATA. REAL TRADERS.</div>
            <h1>Trade smarter with <span>insight.</span></h1>
            <p>
              Research brokers and prop firms using real trader reviews,
              trust scores and incident data before you trade.
            </p>
            <Link href="/rankings" className="ip-primary-button">
              Explore rankings <ArrowRight size={15} />
            </Link>
          </div>

          <div className="ip-hero-art" aria-hidden="true">
            <div className="ip-orbit ip-orbit-one" />
            <div className="ip-orbit ip-orbit-two" />
            <div className="ip-hero-core">
              <div className="ip-core-face">IP</div>
              <div className="ip-core-shadow" />
            </div>
            <div className="ip-hero-caption">built for traders.</div>
          </div>
        </section>

        {/* TRUST PRINCIPLES */}
        <section className="ip-principles">
          {[
            ['01', 'Transparent Data', 'Clear information before you trade.'],
            ['02', 'Real Trader Reviews', 'Experiences from the people using platforms.'],
            ['03', 'Independent Analysis', 'Evidence separated from marketing claims.'],
            ['04', 'Trader First', 'Built around the decisions traders actually make.'],
          ].map(([number, title, copy]) => (
            <div className="ip-principle" key={number}>
              <span>{number}</span>
              <div>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </section>

        {/* RANKINGS */}
        <section className="ip-section">
          <div className="ip-section-head">
            <div>
              <span className="ip-section-kicker"><Trophy size={13} /> TRUST RANKINGS</span>
              <h2>Top trading partners</h2>
            </div>
            <Link href="/rankings" className="ip-text-link">View all <ArrowRight size={13} /></Link>
          </div>

          <div className="ip-ranking-tabs">
            <button
              className={rankingTab === 'brokers' ? 'active' : ''}
              onClick={() => setRankingTab('brokers')}
            >
              <Building2 size={14} /> Brokers
            </button>
            <button
              className={rankingTab === 'propFirms' ? 'active' : ''}
              onClick={() => setRankingTab('propFirms')}
            >
              <TrendingUp size={14} /> Prop Firms
            </button>
          </div>

          <div className="ip-ranking-list">
            {rankings.length ? rankings.map((entity, index) => (
              <button
                key={entity.id}
                className="ip-ranking-row"
                onClick={() => navigateEntity(entity, rankingTab === 'brokers' ? 'broker' : 'prop')}
              >
                <span className={`ip-rank-number ${index < 3 ? 'top' : ''}`}>{index + 1}</span>
                <Logo entity={entity} />
                <span className="ip-ranking-main">
                  <strong>{entity.name}</strong>
                  <small>
                    <Star size={10} fill="currentColor" /> {entity.rating ? Number(entity.rating).toFixed(1) : '—'}
                    <span>·</span>
                    {entity.reviewCount || 0} reviews
                  </small>
                </span>
                <TrustPill score={entity.trustScore || 0} />
                <ArrowRight size={14} className="ip-row-arrow" />
              </button>
            )) : (
              <div className="ip-empty-inline">No {rankingTab === 'brokers' ? 'brokers' : 'prop firms'} available.</div>
            )}
          </div>
        </section>

        {/* OFFERS */}
        {currentOffer && (
          <section className="ip-section ip-offers-section">
            <div className="ip-section-head">
              <div>
                <span className="ip-section-kicker"><span className="ip-offer-dot" /> OFFERS</span>
                <h2>Best offers</h2>
              </div>
              <Link href="/offers" className="ip-text-link">View all <ArrowRight size={13} /></Link>
            </div>

            <div className="ip-offer-stage">
              <div className="ip-offer-stage-top">
                <span>Exclusive offers from top platforms</span>
                <span>{offerIndex + 1} / {offers.length}</span>
              </div>

              <div className="ip-offer-object-area">
                <div className="ip-offer-glow" />
                <AnimatePresence mode="wait" initial={false}>
                  {!offerAnimating && (
                    <motion.div
                      key={`${currentOffer._type}-${currentOffer.id}`}
                      initial={{ opacity: 0, rotateY: offerDirection > 0 ? 75 : -75, y: 18, scale: .86 }}
                      animate={{ opacity: 1, rotateY: 0, y: 0, scale: 1 }}
                      exit={{ opacity: 0, rotateY: offerDirection > 0 ? -75 : 75, y: -8, scale: .9 }}
                      transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}
                      className="ip-offer-object"
                    >
                      <div className="ip-offer-disc" />
                      <Logo entity={currentOffer} large />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ip-offer-info">
                <div className="ip-offer-meta">
                  <span>{currentOffer._type === 'broker' ? 'Broker' : 'Prop Firm'}</span>
                  <span className="ip-offer-score"><ShieldCheck size={12} /> {currentOffer.trustScore || '—'} trust</span>
                </div>
                <h3>{currentOffer.name}</h3>
                <p>{getOfferCopy(currentOffer).title}</p>
                {getOfferCopy(currentOffer).discount && (
                  <strong>{getOfferCopy(currentOffer).discount}</strong>
                )}
              </div>

              <div className="ip-offer-actions">
                <button
                  className="ip-offer-main-button"
                  onClick={() => navigateEntity(currentOffer, currentOffer._type)}
                >
                  View offer <ArrowRight size={15} />
                </button>
                <div className="ip-offer-dots">
                  {offers.map((offer, index) => (
                    <button
                      key={`${offer._type}-${offer.id}`}
                      aria-label={`Show offer ${index + 1}`}
                      className={index === offerIndex ? 'active' : ''}
                      onClick={() => {
                        if (index !== offerIndex && !offerAnimating) {
                          setOfferDirection(index > offerIndex ? 1 : -1);
                          setOfferAnimating(true);
                          window.setTimeout(() => {
                            setOfferIndex(index);
                            setOfferAnimating(false);
                          }, 650);
                        }
                      }}
                    />
                  ))}
                </div>
                <div className="ip-offer-arrows">
                  <button onClick={() => changeOffer(-1)} aria-label="Previous offer">‹</button>
                  <button onClick={() => changeOffer(1)} aria-label="Next offer">›</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LIVE INCIDENTS */}
        <section className="ip-section ip-incidents-section">
          <div className="ip-section-head">
            <div>
              <span className="ip-section-kicker"><Activity size={13} /> LIVE INTELLIGENCE</span>
              <h2>Live incidents</h2>
            </div>
            <Link href="/incidents" className="ip-text-link">See all <ArrowRight size={13} /></Link>
          </div>

          <div className="ip-incident-list">
            {incidents.length ? incidents.slice(0, 4).map((incident) => {
              const meta = incidentMap[incident.type] || { label: incident.type || 'Incident', color: T.amber };
              const Icon = incident.type === 'WITHDRAWAL_PAID' ? CheckCircle2 :
                incident.type === 'WITHDRAWAL_REJECTED' ? XCircle :
                incident.type === 'WITHDRAWAL_DELAY' || incident.type === 'EXECUTION_DELAY' ? Clock3 :
                AlertTriangle;

              return (
                <Link href="/incidents" key={incident.id} className="ip-incident-row">
                  <span className="ip-incident-icon" style={{ color: meta.color }}>
                    <Icon size={15} />
                  </span>
                  <span className="ip-incident-main">
                    <strong>{incident.entityName || incident.broker?.name || incident.propFirm?.name || 'Trading platform'}</strong>
                    <small>{meta.label}</small>
                  </span>
                  <span className="ip-incident-status" style={{ color: meta.color }}>Live</span>
                </Link>
              );
            }) : (
              <div className="ip-no-incidents">
                <ShieldCheck size={17} />
                <span>No recent incidents reported.</span>
              </div>
            )}
          </div>
        </section>

        <footer className="ip-home-footer">
          <span>InsightPip</span>
          <span>Independent trading intelligence</span>
        </footer>
      </main>
    </MobileLayout>
  );
}
