"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
  Search,
  ThumbsUp,
  Flag,
  Activity,
  RefreshCw,
  PenLine,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { notify, requestText } from "@/components/ui/Feedback";
type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  entityName: string;
  entitySlug: string;
  entityType: string;
  user: { name: string };
  createdAt: string;
  isVerified: boolean;
  helpfulCount: number;
  replyCount: number;
  platformStability?: number;
  executionQuality?: number;
  customerSupport?: number;
  reliability?: number;
};
type Incident = {
  id: string;
  title: string;
  description: string;
  incidentType: string;
  resolutionStatus: string;
  createdAt: string;
  broker?: { name: string; slug: string };
  propFirm?: { name: string; slug: string };
  entityType: string;
  entityId: number;
};
export default function Community({
  incidents = false,
}: {
  incidents?: boolean;
}) {
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  const [working, setWorking] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => {
    const c = new AbortController();
    setStatus("loading");
    const qs = new URLSearchParams({
      page: String(page),
      limit: "10",
      sort,
      search,
      ...(type ? { type } : {}),
      ...(incidents ? { status: "APPROVED" } : {}),
    });
    fetch(`/api/${incidents ? "incidents" : "reviews"}?${qs}`, {
      signal: c.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        setReviews(d.reviews || []);
        setReports(d.incidents || []);
        setTotal(d.pagination.total);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => c.abort();
  }, [incidents, type, sort, search, page, retry]);
  async function vote(id: string) {
    if (!user) {
      router.push("/login?redirect=/reviews");
      return;
    }
    setWorking(id);
    try {
      const r = await fetch(`/api/reviews/${id}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: "HELPFUL" }),
      });
      if (!r.ok) throw Error();
      setRetry((n) => n + 1);
    } catch {
      notify("Your vote could not be saved. Please try again.");
    } finally {
      setWorking(null);
    }
  }
  async function report(id: string) {
    if (!user) {
      router.push("/login?redirect=/reviews");
      return;
    }
    const reason = await requestText(
      "Explain the issue with this review. Please do not include sensitive personal information.",
    );
    if (!reason) return;
    try {
      const r = await fetch(`/api/reviews/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const d = await r.json();
      notify(
        r.ok
          ? "Report submitted for moderation."
          : d.error || "Unable to submit report.",
      );
    } catch {
      notify("Unable to submit report. Please try again.");
    }
  }
  return (
    <div className="v2-container">
      <header className="v2-page-heading">
        <span className="v2-eyebrow">
          {incidents ? "INCIDENT INTELLIGENCE" : "THE TRADER PERSPECTIVE"}
        </span>
        <h1>
          {incidents
            ? "Understand the issues. Follow the context."
            : "Real experiences. Better perspective."}
        </h1>
        <p>
          {incidents
            ? "Read published incident reports and their resolution status. Reports describe allegations unless independently confirmed; they are not a finding of wrongdoing."
            : "Read trader experiences alongside provider research. Look at the details, category ratings and verification status before drawing conclusions."}
        </p>
      </header>
      <div className="v2-community-actions">
        <div className="v2-tabs">
          <Link aria-current={!incidents ? "page" : undefined} href="/reviews">
            <MessageSquare size={16} />
            Trader reviews
          </Link>
          <Link aria-current={incidents ? "page" : undefined} href="/incidents">
            <Activity size={16} />
            Incident reports
          </Link>
        </div>
        <Link
          className="v2-button"
          href={incidents ? "/reviews/write?kind=incident" : "/reviews/write"}
        >
          <PenLine size={16} />
          {incidents ? "Report an incident" : "Write a review"}
        </Link>
      </div>
      <div className="v2-community-grid">
        <section>
          <div className="v2-community-filters">
            <label className="v2-search">
              <Search size={17} />
              <input
                aria-label="Search community reports"
                placeholder={
                  incidents ? "Search incidents…" : "Search reviews…"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Provider type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All providers</option>
              <option value="broker">Brokers</option>
              <option value="propFirm">Prop firms</option>
            </select>
            {!incidents && (
              <select
                aria-label="Sort reviews"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Newest first</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
                <option value="mostHelpful">Most helpful</option>
              </select>
            )}
          </div>
          <p className="v2-result-count">
            {status === "ready"
              ? `${total} published ${incidents ? "reports" : "reviews"}`
              : "Community submissions"}
          </p>
          {status === "error" ? (
            <div className="v2-panel v2-state">
              <RefreshCw size={26} />
              <h3>We couldn’t load {incidents ? "incidents" : "reviews"}</h3>
              <p>Please try again. Unavailable data is not counted as zero.</p>
              <button className="v2-button" onClick={() => setRetry(retry + 1)}>
                Try again
              </button>
            </div>
          ) : status === "loading" ? (
            <div className="v2-state" role="status">
              Loading community submissions…
            </div>
          ) : incidents ? (
            reports.length ? (
              reports.map((r) => (
                <article key={r.id} className="v2-review-card">
                  <div className="v2-review-meta">
                    <span>
                      <Activity size={15} />
                      {(r.incidentType || "Reported issue").replaceAll(
                        "_",
                        " ",
                      )}
                    </span>
                    <span className="v2-status">
                      {r.resolutionStatus === "RESOLVED"
                        ? "Resolved"
                        : r.resolutionStatus === "CONFIRMED"
                          ? "Confirmed status"
                          : "Reported allegation"}
                    </span>
                  </div>
                  <h2>{r.title}</h2>
                  <p>{r.description}</p>
                  <div className="v2-card-footer">
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <Link
                      href={`/${r.entityType === "broker" ? "brokers" : "prop-firms"}/${r.broker?.slug || r.propFirm?.slug || r.entityId}`}
                    >
                      {r.broker?.name || r.propFirm?.name || "Provider profile"}
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <Empty incidents />
            )
          ) : reviews.length ? (
            reviews.map((r) => (
              <article key={r.id} className="v2-review-card">
                <div className="v2-review-meta">
                  <span
                    className="v2-stars"
                    aria-label={`${r.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={15}
                        fill={n <= r.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </span>
                  <span className="v2-status">
                    {r.isVerified
                      ? "Verification recorded"
                      : "Experience not independently verified"}
                  </span>
                </div>
                <Link href={`/reviews/${r.id}`}>
                  <h2>{r.title}</h2>
                </Link>
                <div className="v2-review-author">
                  {r.user?.name || "Trader"} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString()} ·{" "}
                  <Link
                    href={`/${r.entityType === "broker" ? "brokers" : "prop-firms"}/${r.entitySlug || ""}`}
                  >
                    {r.entityName}
                  </Link>
                </div>
                <p>{r.content}</p>
                <div className="v2-category-ratings">
                  {[
                    ["Platform", r.platformStability],
                    ["Execution", r.executionQuality],
                    ["Support", r.customerSupport],
                    ["Reliability", r.reliability],
                  ]
                    .filter(([, v]) => typeof v === "number" && v > 0)
                    .map(([label, v]) => (
                      <span key={String(label)}>
                        {label}
                        <strong>{v}/5</strong>
                      </span>
                    ))}
                </div>
                <div className="v2-review-controls">
                  <button
                    disabled={working === r.id}
                    onClick={() => void vote(r.id)}
                  >
                    <ThumbsUp size={14} />
                    Helpful ({r.helpfulCount})
                  </button>
                  <Link href={`/reviews/${r.id}`}>
                    <MessageSquare size={14} />
                    {r.replyCount} replies
                  </Link>
                  <button onClick={() => void report(r.id)}>
                    <Flag size={14} />
                    Report
                  </button>
                </div>
              </article>
            ))
          ) : (
            <Empty />
          )}
          <div className="v2-pagination">
            <button
              disabled={page === 1 || status !== "ready"}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              {page} / {Math.max(1, Math.ceil(total / 10))}
            </span>
            <button
              disabled={page * 10 >= total || status !== "ready"}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </section>
        <aside className="v2-community-aside">
          <ShieldCheck size={28} />
          <h2>Read with context.</h2>
          <p>
            A verified account is different from verified trading experience.
          </p>
          <hr />
          <h3>Look beyond a single score</h3>
          <p>
            Read recent and older experiences. Consider the provider’s response
            and the nature of each reported issue.
          </p>
          <h3>Evidence stays private</h3>
          <p>
            Never post account numbers, identity documents or sensitive payment
            information in public review text.
          </p>
          <Link href="/methodology">
            Trust & transparency <ArrowUpRight size={15} />
          </Link>
          <Link href="/dashboard">
            Track your submissions <ArrowUpRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
function Empty({ incidents = false }: { incidents?: boolean }) {
  return (
    <div className="v2-panel v2-state">
      <MessageSquare size={30} />
      <h3>No matching {incidents ? "reports" : "reviews"}</h3>
      <p>Try adjusting the filters or share your own experience.</p>
      <Link
        className="v2-button"
        href={incidents ? "/reviews/write?kind=incident" : "/reviews/write"}
      >
        Share your experience
      </Link>
    </div>
  );
}
