"use client";
import {defaultHomepage,homepageSchema} from "@/lib/homepage";
import ResearchFeed from "./ResearchFeed";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Users,
  ChartNoAxesCombined,
  HeartHandshake,
  Building2,
  GitCompareArrows,
  BookOpen,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useRegion } from "@/contexts/RegionContext";
type Provider = {
  id: number;
  slug?: string;
  name: string;
  logo?: string;
  rating?: number;
  trustScore?: number;
  isRecommended?:boolean;
  reviewsCount?: number;
  shortDescription?: string;
};
export default function ResearchHome() {
  const [content,setContent]=useState(defaultHomepage);
  useEffect(()=>{fetch("/api/research/homepage").then(r=>r.json()).then(d=>{const parsed=homepageSchema.safeParse(d.content);if(parsed.success)setContent(parsed.data);}).catch(()=>{});},[]);
  const { region } = useRegion();
  const [type, setType] = useState("brokers");
  const [items, setItems] = useState<Provider[]>([]);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setStatus("loading");
    fetch(`/api/research/providers?type=${type}&region=${region}&limit=5&featuredFirst=1`, {
      signal: ctrl.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        setItems(Array.isArray(d.data) ? d.data : []);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => ctrl.abort();
  }, [region, type, retry]);
  return (
    <div className="v2-container">
      <div className="v2-context">
        <span>INDEPENDENT TRADING INTELLIGENCE</span>
        <Link href="/methodology">
          <ShieldCheck size={13} /> Our approach to trust{" "}
          <ArrowUpRight size={13} />
        </Link>
      </div>
      <section className="v2-hero">
        <div>
          <div className="v2-eyebrow">
            <span /> {content.eyebrow.toUpperCase()}
          </div>
          <h1>
            {content.headline}
            <br />
            <em>{content.highlight}</em>
          </h1>
          <p>
            {content.description}
          </p>
          <form className="v2-search" action="/search">
            <Search size={21} />
            <input
              name="q"
              aria-label="Search providers"
              placeholder="Search a broker or prop firm…"
            />
            <button aria-label="Search">
              <ArrowRight size={20} />
            </button>
          </form>
          <div className="v2-hero-links">
            <Link href="/brokers">
              Explore brokers <ArrowUpRight size={16} />
            </Link>
            <Link href="/prop-firms">
              Explore prop firms <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <aside className="v2-intelligence">
          <div className="v2-panel-label">
            <ShieldCheck size={16} /> THE INSIGHT ADVANTAGE <span>01 / 03</span>
          </div>
          <div className="v2-cube" aria-hidden="true">
            <ArrowUpRight size={76} strokeWidth={1.3} />
          </div>
          <h2>{content.cardHeading}</h2>
          <p>
            {content.cardDescription}
          </p>
          <Link href="/methodology">
            Understand the signals <ArrowRight size={17} />
          </Link>
          <div className="v2-art-caption">{content.tagline}</div>
        </aside>
      </section>
      <section className="v2-principles" aria-label="Our principles">
        {[
          [ShieldCheck, "Transparent data", "Sources over assumptions."],
          [Users, "Real trader reviews", "Experience adds perspective."],
          [
            ChartNoAxesCombined,
            "Independent analysis",
            "Context beyond the score.",
          ],
          [HeartHandshake, "Trader first", "Your decision. Better informed."],
        ].map(([Icon, title, copy]) => {
          const I = Icon as typeof ShieldCheck;
          return (
            <div key={String(title)}>
              <I size={22} />
              <div>
                <strong>{String(title)}</strong>
                <p>{String(copy)}</p>
              </div>
            </div>
          );
        })}
      </section>
      <section className="v2-research-grid">
        <div>
          <div className="v2-section-heading">
            <div>
              <span className="v2-eyebrow">YOUR RESEARCH STARTS HERE</span>
              <h2>Discover your options</h2>
            </div>
            <Link href={`/${type}`}>
              View directory <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="v2-panel">
            <div className="v2-tabs" role="group" aria-label="Provider type">
              {[
                ["brokers", "Forex brokers"],
                ["prop-firms", "Prop firms"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  aria-pressed={type === v}
                  onClick={() => setType(v)}
                >
                  {l}
                </button>
              ))}
              <span>Available in your region</span>
            </div>
            <div className="v2-table-head">
              <span>PROVIDER</span>
              <span>TRADER RATING</span>
              <span>TRUST SIGNAL</span>
            </div>
            {status === "loading" ? (
              <div className="v2-state" role="status">
                Loading provider research…
              </div>
            ) : status === "error" ? (
              <div className="v2-state">
                <RefreshCw size={25} />
                <h3>Provider data is unavailable</h3>
                <p>
                  We couldn’t connect to the research database. No sample
                  ratings are shown.
                </p>
                <button
                  className="v2-button"
                  onClick={() => setRetry(retry + 1)}
                >
                  Try again
                </button>
              </div>
            ) : items.length ? (
              items.map((p, i) => (
                <Link
                  className="v2-provider-row"
                  key={p.id}
                  href={`/${type}/${p.slug || p.id}`}
                >
                  <span className="v2-provider-name">
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    <span className="v2-logo">
                      {p.logo ? <img src={p.logo} alt="" /> : p.name[0]}
                    </span>
                    <strong>{p.name}</strong>
                  </span>
                  <span>
                    {p.reviewsCount
                      ? `${Number(p.rating || 0).toFixed(1)} / 5`
                      : "Not yet rated"}
                    <small>{p.reviewsCount || 0} published reviews</small>
                  </span>
                  <span className="v2-score">
                    {p.trustScore ? `${p.trustScore} / 100` : "Not assessed"}
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
              ))
            ) : (
              <div className="v2-state">
                <Building2 size={28} />
                <h3>No providers to display</h3>
                <p>
                  Try another region. Availability is subject to each provider’s
                  terms.
                </p>
              </div>
            )}
            <div className="v2-table-note">
              Ratings reflect available records. A score is not a guarantee.{" "}
              <Link href="/methodology">Read the methodology</Link>
            </div>
          </div>
        </div>
        <aside className="v2-side-stack">
          <Link className="v2-compare-card" href="/compare">
            <GitCompareArrows size={27} />
            <span className="v2-eyebrow">LESS GUESSWORK</span>
            <h3>
              Compare the details.
              <br />
              Find your fit.
            </h3>
            <p>Put trading conditions, costs and restrictions side by side.</p>
            <strong>
              Build a comparison <ArrowRight size={17} />
            </strong>
          </Link>
          <Link className="v2-incident-card" href="/incidents">
            <Activity size={23} />
            <div>
              <h3>Incident intelligence</h3>
              <p>Understand reported issues and their resolution status.</p>
              <strong>
                Visit the incident centre <ArrowRight size={15} />
              </strong>
            </div>
          </Link>
        </aside>
      </section>
      <section className="v2-review-banner">
        <div>
          <Users size={30} />
          <span className="v2-eyebrow">EXPERIENCE MATTERS</span>
          <h2>
            Your experience helps
            <br />
            the next trader.
          </h2>
          <p>
            Share a balanced review. Explain what worked, what didn’t, and what
            other traders should know.
          </p>
          <Link className="v2-button" href="/reviews">
            Explore trader reviews <ArrowRight size={17} />
          </Link>
        </div>
        <div className="v2-review-principles">
          <h3>Trust is earned through transparency.</h3>
          <p>
            <ShieldCheck size={18} /> Account verification and trading
            experience verification are different signals.
          </p>
          <p>
            <Users size={18} /> Positive and critical experiences both deserve
            fair treatment.
          </p>
          <p>
            <BookOpen size={18} /> Read the evidence, sources and context behind
            a decision.
          </p>
          <Link href="/methodology">
            Our transparency principles <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="v2-section">
        <div className="v2-section-heading">
          <div>
            <span className="v2-eyebrow">BUILD YOUR KNOWLEDGE</span>
            <h2>Research with perspective</h2>
          </div>
          <Link href="/blog">
            Explore learning <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="v2-discovery-cards">
          {[
            [
              "01",
              "Understand the provider",
              "Explore broker information, regional eligibility and account conditions.",
              "/brokers",
            ],
            [
              "02",
              "Understand the challenge",
              "Research funding programs, drawdown rules and payout conditions.",
              "/prop-firms",
            ],
            [
              "03",
              "Understand the experience",
              "Read trader perspectives alongside provider information.",
              "/reviews",
            ],
          ].map(([n, t, c, u]) => (
            <Link key={n} href={u}>
              <span>
                {n}
                <ArrowUpRight size={22} />
              </span>
              <h3>{t}</h3>
              <p>{c}</p>
            </Link>
          ))}
        </div>
      </section>
      <ResearchFeed />
    </div>
  );
}
