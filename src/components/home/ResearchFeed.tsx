"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Activity, BookOpen, Star, Tag } from "lucide-react";
import { useRegion } from "@/contexts/RegionContext";
type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
};
type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  isVerified: boolean;
  user: { name: string };
  broker?: { name: string };
  propFirm?: { name: string };
};
type Incident = {
  id: string;
  title: string;
  resolutionStatus: string;
  broker?: { name: string };
  propFirm?: { name: string };
};
type Offer = {
  id: string;
  title: string;
  provider: string;
  description?: string;
  slug: string;
  type: string;
};
export default function ResearchFeed() {
  const { region } = useRegion();
  const [feed, setFeed] = useState<{
    articles: Article[];
    reviews: Review[];
    incidents: Incident[];
  } | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    Promise.all([
      fetch("/api/research/feed?region=" + region, { signal: c.signal }).then(
        async (r) => {
          if (!r.ok) throw Error();
          return r.json();
        },
      ),
      fetch("/api/research/offers?region=" + region, { signal: c.signal }).then(
        async (r) => (r.ok ? r.json() : { offers: [] }),
      ),
    ])
      .then(([f, o]) => {
        setFeed(f);
        setOffers(o.offers.slice(0, 3));
        setFailed(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => c.abort();
  }, [region]);
  return (
    <div className="v2-home-feed">
      {failed ? (
        <div className="v2-notice">
          <Activity size={20} />
          <div>
            <strong>Latest activity is temporarily unavailable.</strong>
            <p>Open the research directories or try again later.</p>
          </div>
        </div>
      ) : !feed ? (
        <div className="v2-state" role="status">
          Loading community research…
        </div>
      ) : (
        <>
          <section className="v2-home-feed-section">
            <div className="v2-section-title">
              <div>
                <span className="v2-eyebrow">THE TRADER PERSPECTIVE</span>
                <h2>Recent experiences</h2>
              </div>
              <Link href="/reviews">
                All reviews <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="v2-provider-grid">
              {feed.reviews.length ? (
                feed.reviews.map((r) => (
                  <article className="v2-provider-card" key={r.id}>
                    <span className="v2-review-stars">
                      {"★".repeat(r.rating)}
                    </span>
                    <h3>
                      <Link href={"/reviews/" + r.id}>{r.title}</Link>
                    </h3>
                    <small>
                      {r.broker?.name || r.propFirm?.name} ·{" "}
                      {r.user.name || "Trader"}
                    </small>
                    <p>
                      {r.content.slice(0, 180)}
                      {r.content.length > 180 ? "…" : ""}
                    </p>
                    <small>
                      {r.isVerified
                        ? "Trading experience independently verified"
                        : "Trading experience unverified"}
                    </small>
                  </article>
                ))
              ) : (
                <div className="v2-panel v2-state">
                  <Star />
                  <h3>Trader experiences belong here</h3>
                  <p>Published reviews will appear after moderation.</p>
                  <Link href="/reviews/write">Share your experience</Link>
                </div>
              )}
            </div>
          </section>
          <div className="v2-home-intelligence">
            <section className="v2-panel v2-profile-section">
              <div className="v2-section-title">
                <h2>
                  <Activity size={20} />
                  Incident intelligence
                </h2>
                <Link href="/incidents">View all</Link>
              </div>
              {feed.incidents.length ? (
                feed.incidents.map((i) => (
                  <article className="v2-source" key={i.id}>
                    <span className="v2-status">{i.resolutionStatus}</span>
                    <h3>
                      <Link href={"/incidents/" + i.id}>{i.title}</Link>
                    </h3>
                    <small>
                      {i.broker?.name || i.propFirm?.name} · Published trader
                      report
                    </small>
                  </article>
                ))
              ) : (
                <p>
                  No public incidents are recorded for this region. This does
                  not guarantee the absence of issues.
                </p>
              )}
            </section>
            <section className="v2-panel v2-profile-section">
              <div className="v2-section-title">
                <h2>
                  <Tag size={20} />
                  Offers with context
                </h2>
                <Link href="/offers">View all</Link>
              </div>
              {offers.length ? (
                offers.map((o) => (
                  <article className="v2-source" key={o.id}>
                    <span className="v2-eyebrow">{o.provider}</span>
                    <h3>
                      <Link href={"/" + o.type + "/" + o.slug}>{o.title}</Link>
                    </h3>
                    <p>
                      {o.description?.slice(0, 130) ||
                        "Confirm full terms with the provider."}
                    </p>
                    <small>
                      Eligibility and source verification require confirmation.
                    </small>
                  </article>
                ))
              ) : (
                <p>
                  No current offers are recorded for this region. Review
                  provider terms before using a promotion.
                </p>
              )}
            </section>
          </div>
          <section className="v2-home-feed-section">
            <div className="v2-section-title">
              <div>
                <span className="v2-eyebrow">RESEARCH & LEARNING</span>
                <h2>Read beyond the headline.</h2>
              </div>
              <Link href="/blog">
                Research library <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="v2-provider-grid">
              {feed.articles.length ? (
                feed.articles.map((a) => (
                  <article className="v2-provider-card" key={a.id}>
                    <span className="v2-eyebrow">{a.category}</span>
                    <h3>
                      <Link href={"/blog/" + a.slug}>{a.title}</Link>
                    </h3>
                    <p>{a.summary}</p>
                    <Link href={"/blog/" + a.slug}>
                      Read article <ArrowUpRight size={15} />
                    </Link>
                  </article>
                ))
              ) : (
                <div className="v2-panel v2-state">
                  <BookOpen />
                  <h3>The research library is growing.</h3>
                  <p>
                    Published explainers and provider research will appear here.
                  </p>
                  <Link href="/blog">Explore the library</Link>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
