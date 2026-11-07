"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRegion } from "@/contexts/RegionContext";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ShieldCheck,
  Star,
  Activity,
  BookOpen,
  MessageSquare,
  FileCheck2,
  RefreshCw,
} from "lucide-react";
import SaveProvider from "./SaveProvider";
type Provider = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  logo?: string;
  website: string;
  headquarters?: string;
  founded?: number;
  updatedAt: string;
  lastReviewed?: string;
  accountTypes?: Record<string, unknown>[];
  programs?: Record<string, unknown>[];
  [key: string]: unknown;
};
type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  isVerified: boolean;
  createdAt: string;
  user: { name: string };
  _count: { evidence: number };
  replies: { id: string; content: string; replyType: string }[];
};
type Incident = {
  id: string;
  title: string;
  incidentType: string;
  resolutionStatus: string;
  verifiedBadge: boolean;
  reportDate: string;
};
type Source = {
  id: string;
  url: string;
  label: string;
  category: string;
  verifiedAt?: string;
  note?: string;
};
type Data = {
  provider: Provider;
  reviews: Review[];
  rating: number | null;
  reviewCount: number;
  distribution: { rating: number; _count: number }[];
  categories: Record<string, number | null>;
  incidents: Incident[];
  sources: Source[];
};
export function recorded(value: unknown): string {
  if (value === null || value === undefined || value === "")
    return "Not provided";
  if (typeof value === "boolean")
    return value ? "Yes (recorded)" : "No (recorded)";
  if (Array.isArray(value))
    return value.length ? value.map(recorded).join(" · ") : "Not provided";
  if (typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1")}: ${recorded(v)}`)
      .join(" · ");
  return String(value);
}
function safeUrl(value: unknown) {
  try {
    const u = new URL(String(value));
    return ["http:", "https:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
const groupFields: Record<string, [string, string][]> = {
  "Company & background": [
    ["Founded", "founded"],
    ["Headquarters", "headquarters"],
    ["Legal name", "legalName"],
    ["Company number", "companyNumber"],
    ["Corporate address", "corporateAddress"],
    ["Leadership", "ceo"],
    ["Website", "website"],
  ],
  "Trading conditions": [
    ["Minimum deposit", "minDeposit"],
    ["Maximum leverage", "maxLeverage"],
    ["Spreads", "averageSpreads"],
    ["Commissions", "commissions"],
    ["Commission notes", "commissionNotes"],
    ["Instruments", "instruments"],
    ["Platforms", "platforms"],
    ["Minimum trade size", "minTradeSize"],
    ["Order execution", "orderExecution"],
    ["Account currencies", "accountCurrencies"],
  ],
  "Deposits & withdrawals": [
    ["Deposit methods", "depositMethods"],
    ["Withdrawal methods", "withdrawalMethods"],
    ["Processing time", "withdrawalProcessingTime"],
    ["Withdrawal fee", "withdrawalFee"],
    ["Minimum withdrawal", "minWithdrawal"],
    ["Deposit processing", "depositProcessingTime"],
    ["Inactivity fee", "inactivityFee"],
  ],
  "Rules & restrictions": [
    ["News trading rules", "newsTradingRestrictions"],
    ["News trading window", "newsTradingWindow"],
    ["Weekend holding", "weekendHolding"],
    ["EA trading", "eaTrading"],
    ["Copy trading rules", "copyTradingRules"],
    ["Consistency rule", "consistencyRule"],
    ["Payout schedule", "payoutSchedule"],
    ["Refund conditions", "refundConditions"],
    ["Profit split", "profitSplit"],
  ],
  "Availability & regulation": [
    ["Available regions", "regions"],
    ["Restricted regions", "restrictedRegions"],
    ["Regional notes", "regionNotes"],
    ["Entity mapping", "entityMapping"],
    ["Regulatory information (recorded claim)", "regulation"],
    ["Regulatory bodies", "regulatoryBodies"],
    ["Warnings", "regulatoryWarnings"],
  ],
  "Customer support": [
    ["Contact email", "contactEmail"],
    ["Contact phone", "contactPhone"],
    ["Languages", "supportLanguages"],
    ["Availability", "supportAvailability"],
    ["Account verification", "accountVerification"],
  ],
};
export default function ProviderProfile({
  type,
  slug,
}: {
  type: "brokers" | "prop-firms";
  slug: string;
}) {
  const { region } = useRegion();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [restricted, setRestricted] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setData(null);
    setError("");
    fetch(
      `/api/research/provider?${new URLSearchParams({ type, slug, region })}`,
      { signal: c.signal },
    )
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setRestricted(!!d.restricted);
          throw Error(d.error);
        }
        setData(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [type, slug, region, retry]);
  if (error)
    return (
      <div className="v2-container v2-state">
        <Building2 size={34} />
        <h1>{restricted ? "Regional availability" : "Research unavailable"}</h1>
        <p>{error}</p>
        <Link className="v2-button" href={"/" + type}>
          Explore alternatives
        </Link>
        {!restricted && (
          <button className="v2-button" onClick={() => setRetry(retry + 1)}>
            <RefreshCw size={16} />
            Retry
          </button>
        )}
      </div>
    );
  if (!data)
    return (
      <div role="status" className="v2-container v2-state">
        Loading provider research…
      </div>
    );
  const p = data.provider;
  const partner = safeUrl(p.signupLink);
  const destination = partner || safeUrl(p.website);
  const tabs = [
    "Overview",
    type === "brokers" ? "Accounts" : "Funding programs",
    "Trading conditions",
    "Reviews",
    "Incidents",
    "Sources",
  ];
  return (
    <div className="v2-container v2-profile">
      <Link className="v2-back" href={"/" + type}>
        <ArrowLeft size={15} /> {type === "brokers" ? "Broker" : "Prop firm"}{" "}
        directory
      </Link>
      <header className="v2-profile-header">
        <div className="v2-profile-identity">
          <div className="v2-profile-logo">
            {p.logo ? <Image src={p.logo} alt="" width={80} height={80} unoptimized={!p.logo.startsWith("/")}/> : <Building2 size={35} />}
          </div>
          <div>
            <span className="v2-eyebrow">
              {type === "brokers" ? "BROKER RESEARCH" : "PROP FIRM RESEARCH"}
            </span>
            <h1>{p.name}</h1>
            <p>
              {p.shortDescription ||
                p.headquarters ||
                "Independent provider research"}
            </p>
          </div>
        </div>
        <div className="v2-profile-actions">
          <SaveProvider id={p.id} type={type} />
          <Link
            className="v2-button"
            href={`/compare?type=${type}&ids=${p.id}`}
          >
            Compare
          </Link>
          {destination && (
            <a
              className="v2-button v2-button-primary"
              href={destination}
              target="_blank"
              rel={partner ? "sponsored noopener noreferrer" : "noopener noreferrer"}
            >
              {partner ? "Visit partner site" : "Visit provider"} <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </header>
      <p className="v2-form-note">
        {partner && "InsightPip may earn a commission if you sign up through this partner link. "}Check the provider’s
        current terms and regional eligibility before committing money.
      </p>
      <div className="v2-profile-signals">
        <div>
          <Star size={20} />
          <span>Trader rating</span>
          <strong>
            {data.rating ? data.rating.toFixed(1) + "/5" : "No ratings yet"}
          </strong>
          <small>{data.reviewCount} published reviews</small>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>Trust Score</span>
          <strong>Not assessed</strong>
          <Link href="/methodology">
            How trust signals work <ArrowUpRight size={12} />
          </Link>
        </div>
        <div>
          <Activity size={20} />
          <span>Public incident reports</span>
          <strong>
            {data.incidents.length}
            {data.incidents.length === 20 ? "+" : ""}
          </strong>
          <small>Allegations and resolution status shown separately</small>
        </div>
        <div>
          <FileCheck2 size={20} />
          <span>Research record</span>
          <strong>
            {p.lastReviewed
              ? new Date(p.lastReviewed).toLocaleDateString()
              : "Verification pending"}
          </strong>
          <small>Updated {new Date(p.updatedAt).toLocaleDateString()}</small>
        </div>
      </div>
      <nav className="v2-profile-tabs" aria-label="Provider information">
        {tabs.map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
            {t === "Reviews" ? " · " + data.reviewCount : ""}
          </button>
        ))}
      </nav>
      {tab === "Overview" && (
        <div className="v2-profile-columns">
          <div>
            <section className="v2-panel v2-profile-section">
              <h2>About {p.name}</h2>
              <p className="v2-profile-description">
                {p.description ||
                  "A company description has not been provided yet."}
              </p>
              <Fields
                title="Company & background"
                fields={groupFields["Company & background"]}
                provider={p}
              />
            </section>
            <section className="v2-panel v2-profile-section">
              <h2>Make a more informed decision</h2>
              <div className="v2-profile-journeys">
                <button
                  onClick={() =>
                    setTab(type === "brokers" ? "Accounts" : "Funding programs")
                  }
                >
                  <BookOpen />
                  Explore{" "}
                  {type === "brokers" ? "account types" : "program rules"}
                  <ArrowUpRight />
                </button>
                <button onClick={() => setTab("Reviews")}>
                  <MessageSquare />
                  Read trader experiences
                  <ArrowUpRight />
                </button>
                <button onClick={() => setTab("Incidents")}>
                  <Activity />
                  Review reported issues
                  <ArrowUpRight />
                </button>
              </div>
            </section>
          </div>
          <aside className="v2-panel v2-profile-section">
            <ShieldCheck size={25} />
            <h2>Read the context.</h2>
            <p>
              Ratings reflect published trader reviews. A Trust Score has not
              been assessed under a validated scoring method.
            </p>
            <p>
              Regulatory information is a recorded claim until a source is
              attached. A database update date does not mean every fact was
              independently verified.
            </p>
            <Link href="/methodology">Our transparency principles</Link>
            <hr />
            <h3>Share your experience</h3>
            <p>Help another trader understand this provider.</p>
            <Link
              className="v2-button"
              href={`/reviews/write?type=${type}&provider=${p.id}&name=${encodeURIComponent(p.name)}`}
            >
              Write a review
            </Link>
          </aside>
        </div>
      )}
      {(tab === "Accounts" || tab === "Funding programs") && (
        <section>
          <div className="v2-section-title">
            <h2>{tab}</h2>
            <small>
              Rules may vary by offering. Confirm the current contract.
            </small>
          </div>
          {(type === "brokers" ? p.accountTypes : p.programs)?.length ? (
            (type === "brokers" ? p.accountTypes : p.programs)!.map((o, i) => (
              <details
                className="v2-panel v2-program"
                key={String(o.id || i)}
                open={i === 0}
              >
                <summary>
                  <span>{recorded(o.name)}</span>
                  <small>{recorded(o.type || o.spreadType)}</small>
                </summary>
                <dl className="v2-fact-list">
                  {Object.entries(o)
                    .filter(
                      ([k]) =>
                        ![
                          "id",
                          "brokerId",
                          "propFirmId",
                          "createdAt",
                          "updatedAt",
                          "name",
                        ].includes(k),
                    )
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>{k.replace(/([A-Z])/g, " $1")}</dt>
                        <dd>{recorded(v)}</dd>
                      </div>
                    ))}
                </dl>
                <Link href={`/compare?type=${type}&ids=${p.id}&accounts=${p.id}:${o.id}`}>
                  Compare this {type === "brokers" ? "account" : "program"}{" "}
                  <ArrowUpRight size={14} />
                </Link>
              </details>
            ))
          ) : (
            <div className="v2-panel v2-state">
              <BookOpen />
              <h3>No structured offerings provided</h3>
              <p>
                Account and program details have not been recorded. Check the
                provider’s current terms.
              </p>
            </div>
          )}
        </section>
      )}
      {tab === "Trading conditions" && (
        <div className="v2-profile-facts">
          {Object.entries(groupFields)
            .filter(([name]) => name !== "Company & background")
            .map(([name, fields]) => (
              <section className="v2-panel v2-profile-section" key={name}>
                <Fields title={name} fields={fields} provider={p} />
                {name === "Availability & regulation" && (
                  <p className="v2-form-note">
                    Check the Sources tab for regulatory references. Unsourced
                    information is not confirmed.
                  </p>
                )}
              </section>
            ))}
        </div>
      )}
      {tab === "Reviews" && (
        <div className="v2-profile-columns">
          <div>
            <div className="v2-section-title">
              <h2>Trader experiences</h2>
              <Link
                href={`/reviews/write?type=${type}&provider=${p.id}&name=${encodeURIComponent(p.name)}`}
              >
                Write a review
              </Link>
            </div>
            {data.reviews.length ? (
              data.reviews.map((r) => (
                <article className="v2-panel v2-contribution" key={r.id}>
                  <span className="v2-review-stars">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                  <h3>
                    <Link href={"/reviews/" + r.id}>{r.title}</Link>
                  </h3>
                  <small>
                    {r.user.name || "Trader"} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()} ·{" "}
                    {r.isVerified
                      ? "Trading experience independently verified"
                      : r._count.evidence
                        ? "Evidence submitted; not independently verified"
                        : "Trading experience unverified"}
                  </small>
                  <p>{r.content}</p>
                  {r.replies.map((reply) => (
                    <blockquote key={reply.id}>
                      <strong>
                        {reply.replyType === "ADMIN"
                          ? "Moderator response"
                          : "Provider response"}
                      </strong>
                      <p>{reply.content}</p>
                    </blockquote>
                  ))}
                </article>
              ))
            ) : (
              <div className="v2-panel v2-state">
                <MessageSquare />
                <h3>No published reviews yet</h3>
                <p>Be the first to share a balanced experience.</p>
              </div>
            )}
            <Link
              className="v2-button"
              href={"/reviews?search=" + encodeURIComponent(p.name)}
            >
              Browse all trader reviews
            </Link>
          </div>
          <aside className="v2-panel v2-profile-section">
            <h2>
              {data.rating ? data.rating.toFixed(1) + "/5" : "No rating yet"}
            </h2>
            <p>{data.reviewCount} published reviews</p>
            {[5, 4, 3, 2, 1].map((n) => {
              const count =
                data.distribution.find((x) => x.rating === n)?._count || 0;
              return (
                <div className="v2-rating-bar" key={n}>
                  <span>{n} ★</span>
                  <progress max={data.reviewCount || 1} value={count} />
                  <span>{count}</span>
                </div>
              );
            })}
            <h3>Experience categories</h3>
            <dl className="v2-fact-list">
              {Object.entries(data.categories).map(([k, v]) => (
                <div key={k}>
                  <dt>{k.replace(/([A-Z])/g, " $1")}</dt>
                  <dd>{v ? v.toFixed(1) + "/5" : "Not rated"}</dd>
                </div>
              ))}
            </dl>
            <small>
              Positive and critical reviews follow the same moderation process.
            </small>
          </aside>
        </div>
      )}
      {tab === "Incidents" && (
        <section>
          <div className="v2-section-title">
            <h2>Reported issues & resolutions</h2>
            <Link
              href={`/reviews/write?kind=incident&type=${type}&provider=${p.id}&name=${encodeURIComponent(p.name)}`}
            >
              Report an incident
            </Link>
          </div>
          <p className="v2-form-note">
            A published report is an allegation unless its facts have been
            independently confirmed. Resolution status is shown separately.
          </p>
          {data.incidents.length ? (
            data.incidents.map((i) => (
              <article className="v2-panel v2-contribution" key={i.id}>
                <span className="v2-status">{i.resolutionStatus}</span>
                <h3>
                  <Link href={"/incidents/" + i.id}>{i.title}</Link>
                </h3>
                <p>
                  {i.incidentType.replaceAll("_", " ")} ·{" "}
                  {i.verifiedBadge
                    ? "Moderator marked confirmed; inspect the report context"
                    : "Trader allegation"}
                </p>
                <small>
                  Reported {new Date(i.reportDate).toLocaleDateString()}
                </small>
              </article>
            ))
          ) : (
            <div className="v2-panel v2-state">
              <Activity />
              <h3>No public reports recorded</h3>
              <p>This does not guarantee the absence of issues.</p>
            </div>
          )}
        </section>
      )}
      {tab === "Sources" && (
        <section className="v2-panel v2-profile-section">
          <h2>Sources & verification</h2>
          <p>
            Sources help you assess each claim. Check the source’s publication
            date and the relevant legal entity.
          </p>
          {data.sources.length ? (
            data.sources.map((s) => (
              <article className="v2-source" key={s.id}>
                <span className="v2-eyebrow">{s.category}</span>
                <h3>
                  {safeUrl(s.url) ? (
                    <a
                      href={safeUrl(s.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.label} <ArrowUpRight size={15} />
                    </a>
                  ) : (
                    s.label
                  )}
                </h3>
                <p>{s.note}</p>
                <small>
                  {s.verifiedAt
                    ? "Checked " + new Date(s.verifiedAt).toLocaleDateString()
                    : "Not independently checked"}
                </small>
              </article>
            ))
          ) : (
            <div className="v2-state">
              <FileCheck2 />
              <h3>Source references are pending</h3>
              <p>
                Provider details should be treated as unverified until source
                references are attached.
              </p>
            </div>
          )}
          <Link
            href={`/reviews/write?kind=incident&type=${type}&provider=${p.id}&name=${encodeURIComponent(p.name)}`}
          >
            Report a correction or concern
          </Link>
        </section>
      )}
    </div>
  );
}
function Fields({
  title,
  fields,
  provider,
}: {
  title: string;
  fields: [string, string][];
  provider: Provider;
}) {
  return (
    <>
      <h2>{title}</h2>
      <dl className="v2-fact-list">
        {fields.map(([label, key]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{recorded(provider[key])}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
