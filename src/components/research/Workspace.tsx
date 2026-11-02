"use client";
import {encodeChoices} from "@/lib/comparison-offerings";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import {
  Bookmark,
  Bell,
  MessageSquare,
  Activity,
  GitCompareArrows,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { notify, confirmAction, requestText } from "@/components/ui/Feedback";
type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
};
type Saved = {
  id: number;
  entityId: number;
  entityName: string;
  entityType: string;
  entitySlug: string;
  notes?: string;
};
type Comparison = {
  id: number;
  name: string;
  items: { type: string; ids: number[] };
  criteria?:{selection?:Record<number,string>;optionSelection?:Record<number,string>};
  updatedAt: string;
};
type Contribution = {
  id: string;
  title: string;
  content?: string;
  description?: string;
  rating?: number;
  status: string;
  moderationNote?: string;
  resolutionStatus?: string;
  entityName?: string;
  entitySlug?: string;
  entityType?: string;
  createdAt: string;
};
type Overview = {
  counts: {
    reviews: number;
    pending: number;
    incidents: number;
    saved: number;
    comparisons: number;
  };
  notifications: Notice[];
  emailVerified: boolean;
};
async function json(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Unable to load this workspace");
  return d;
}
export default function Workspace({
  view = "overview",
}: {
  view?: "overview" | "saved" | "notifications" | "reviews" | "incidents";
}) {
  const { user, isLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [notifications, setNotifications] = useState<Notice[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [edit, setEdit] = useState<Contribution | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        if (view === "overview") {
          const d = await json("/api/user/overview");
          if (active) setOverview(d);
        } else if (view === "saved") {
          const [s, c] = await Promise.all([
            json("/api/user/favorites"),
            json("/api/user/comparisons"),
          ]);
          if (active) {
            setSaved(s.favorites);
            setComparisons(c.comparisons);
          }
        } else if (view === "notifications") {
          const d = await json("/api/user/notifications");
          if (active) setNotifications(d.notifications);
        } else {
          const d = await json(`/api/user/${view}?page=${page}&limit=10`);
          if (active) {
            setContributions(d[view]);
            setPages(d.pagination?.pages || 1);
          }
        }
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Connection failed");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [view, user, isLoading, retry, page]);
  const title =
    view === "overview"
      ? "Your research workspace."
      : view === "saved"
        ? "Keep your research close."
        : view === "notifications"
          ? "Updates that matter."
          : view === "reviews"
            ? "Your trader reviews."
            : "Your incident reports.";
  if (!isLoading && !user)
    return (
      <div className="v2-state">
        <ShieldCheck size={32} />
        <h1>Your trader workspace</h1>
        <p>Sign in to manage your research and contributions.</p>
        <Link
          className="v2-button"
          href={`/login?redirect=${encodeURIComponent("/dashboard" + (view === "overview" ? "" : "/" + view))}`}
        >
          Sign in
        </Link>
      </div>
    );
  const notices =
    view === "overview" ? overview?.notifications || [] : notifications;
  return (
    <div>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">
          {user?.name
            ? `WELCOME, ${user.name.toUpperCase()}`
            : "TRADER WORKSPACE"}
        </span>
        <h1>{title}</h1>
        <p>
          Research with context. Follow your contributions. Stay in control.
        </p>
      </header>
      {error ? (
        <div className="v2-panel v2-state" role="alert">
          <RefreshCw />
          <h2>Workspace unavailable</h2>
          <p>{error}</p>
          <button className="v2-button" onClick={() => setRetry(retry + 1)}>
            Retry
          </button>
        </div>
      ) : loading || isLoading ? (
        <div role="status" className="v2-state">
          Loading your workspace…
        </div>
      ) : (
        <>
          {view === "overview" && overview && (
            <>
              <div className="v2-workspace-metrics">
                {[
                  [
                    "Reviews",
                    overview.counts.reviews,
                    MessageSquare,
                    "/dashboard/reviews",
                  ],
                  [
                    "Awaiting moderation",
                    overview.counts.pending,
                    ShieldCheck,
                    "/dashboard/reviews",
                  ],
                  [
                    "Incident reports",
                    overview.counts.incidents,
                    Activity,
                    "/dashboard/incidents",
                  ],
                  [
                    "Saved providers",
                    overview.counts.saved,
                    Bookmark,
                    "/dashboard/saved",
                  ],
                  [
                    "Comparisons",
                    overview.counts.comparisons,
                    GitCompareArrows,
                    "/dashboard/saved",
                  ],
                ].map(([label, count, Icon, href]) => {
                  const Glyph = Icon as typeof MessageSquare;
                  return (
                    <Link
                      key={String(label)}
                      href={String(href)}
                      className="v2-panel v2-workspace-metric"
                    >
                      <Glyph size={21} />
                      <strong>{String(count)}</strong>
                      <span>{String(label)}</span>
                    </Link>
                  );
                })}
              </div>
              {!overview.emailVerified && (
                <div className="v2-notice">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Your email has not been verified.</strong>
                    <p>
                      Confirm your address in account settings. This is separate
                      from verification of trading experience.
                    </p>
                    <Link href="/dashboard/profile">
                      Manage account <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
              <div className="v2-workspace-ctas">
                <Link
                  className="v2-button v2-button-primary"
                  href="/reviews/write"
                >
                  Write a review
                </Link>
                <Link className="v2-button" href="/reviews/write?kind=incident">
                  Report an incident
                </Link>
                <Link className="v2-button" href="/compare">
                  Build a comparison
                </Link>
              </div>
            </>
          )}
          {(view === "overview" || view === "notifications") && (
            <section className="v2-panel v2-notice-list">
              <div className="v2-section-title">
                <h2>
                  {view === "overview" ? "Recent updates" : "Notifications"}
                </h2>
                {view === "overview" ? (
                  <Link href="/dashboard/notifications">View all</Link>
                ) : (
                  <button
                    onClick={async () => {
                      await json("/api/user/notifications", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: "{}",
                      });
                      setRetry(retry + 1);
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notices.length ? (
                notices.map((n) => (
                  <article key={n.id} className={n.readAt ? "" : "unread"}>
                    <Bell size={18} />
                    <div>
                      <Link
                        href={
                          n.href.startsWith("/") && !n.href.startsWith("//")
                            ? n.href
                            : "/dashboard"
                        }
                        onClick={() =>
                          void json("/api/user/notifications", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: n.id }),
                          }).catch(() => {})
                        }
                      >
                        <h3>{n.title}</h3>
                      </Link>
                      <p>{n.body}</p>
                      <time>{new Date(n.createdAt).toLocaleString()}</time>
                    </div>
                  </article>
                ))
              ) : (
                <div className="v2-state">
                  <Bell size={28} />
                  <h3>You’re up to date</h3>
                  <p>
                    Review and incident decisions will appear here with a link
                    to the relevant content.
                  </p>
                </div>
              )}
            </section>
          )}
          {view === "saved" && (
            <>
              <section>
                <h2>
                  Saved providers{" "}
                  <span className="v2-muted">{saved.length}</span>
                </h2>
                <div className="v2-provider-grid">
                  {saved.map((s) => (
                    <article className="v2-provider-card" key={s.id}>
                      <span className="v2-eyebrow">
                        {s.entityType === "broker" ? "BROKER" : "PROP FIRM"}
                      </span>
                      <h2>
                        <Link
                          href={`/${s.entityType === "broker" ? "brokers" : "prop-firms"}/${s.entitySlug}`}
                        >
                          {s.entityName}
                        </Link>
                      </h2>
                      <p>{s.notes || "Saved to your research shortlist."}</p>
                      <div className="v2-card-footer">
                        <Link
                          href={`/compare?type=${s.entityType === "broker" ? "brokers" : "prop-firms"}&ids=${s.entityId}`}
                        >
                          Compare <ArrowUpRight size={15} />
                        </Link>
                        <button
                          onClick={async () => {
                            if (
                              !(await confirmAction(
                                "Remove this provider from your saved list?",
                              ))
                            )
                              return;
                            try {
                              await json("/api/user/favorites?id=" + s.id, {
                                method: "DELETE",
                              });
                              setRetry(retry + 1);
                            } catch (e) {
                              notify(String(e));
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {!saved.length && (
                  <div className="v2-panel v2-state">
                    <Bookmark />
                    <h3>Your shortlist starts here</h3>
                    <p>
                      Save providers from the directories or provider profiles.
                    </p>
                    <Link className="v2-button" href="/brokers">
                      Explore providers
                    </Link>
                  </div>
                )}
              </section>
              <section className="v2-saved-comparisons">
                <h2>Saved comparisons</h2>
                {comparisons.length ? (
                  comparisons.map((c) => (
                    <article key={c.id} className="v2-panel v2-saved-row">
                      <GitCompareArrows />
                      <div>
                        <Link
                          href={`/compare?type=${c.items.type}&ids=${c.items.ids.join(",")}&accounts=${encodeURIComponent(encodeChoices(c.criteria?.selection||{}))}&options=${encodeURIComponent(encodeChoices(c.criteria?.optionSelection||{}))}`}
                        >
                          <h3>{c.name}</h3>
                        </Link>
                        <small>
                          Saved {new Date(c.updatedAt).toLocaleDateString()} ·{" "}
                          {c.items.ids.length} providers
                        </small>
                      </div>
                      <button
                        onClick={async () => {
                          if (
                            !(await confirmAction(
                              "Remove this saved comparison?",
                            ))
                          )
                            return;
                          await json("/api/user/comparisons?id=" + c.id, {
                            method: "DELETE",
                          });
                          setRetry(retry + 1);
                        }}
                      >
                        Remove
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="v2-panel v2-state">
                    <GitCompareArrows />
                    <h3>No saved comparisons yet</h3>
                    <Link href="/compare">Build your first comparison</Link>
                  </div>
                )}
              </section>
            </>
          )}
          {(view === "reviews" || view === "incidents") && (
            <>
              {!contributions.length ? (
                <div className="v2-panel v2-state">
                  <MessageSquare size={28} />
                  <h2>No submissions yet</h2>
                  <p>Share your experience to help the next trader.</p>
                  <Link
                    className="v2-button"
                    href={
                      "/reviews/write" +
                      (view === "incidents" ? "?kind=incident" : "")
                    }
                  >
                    Start a submission
                  </Link>
                </div>
              ) : (
                contributions.map((c) => (
                  <article className="v2-panel v2-contribution" key={c.id}>
                    <div className="v2-section-title">
                      <span className="v2-status">
                        {c.status.replaceAll("_", " ")}
                      </span>
                      <time>{new Date(c.createdAt).toLocaleDateString()}</time>
                    </div>
                    <h2>{c.title}</h2>
                    <small>
                      {c.entityName || "Provider submission"}
                      {c.rating ? " · " + c.rating + "/5" : ""}
                      {c.resolutionStatus
                        ? " · Resolution: " + c.resolutionStatus
                        : ""}
                    </small>
                    <p>{c.content || c.description}</p>
                    {c.moderationNote && (
                      <div className="v2-notice">
                        <strong>Moderator note</strong>
                        <p>{c.moderationNote}</p>
                      </div>
                    )}
                    <div className="v2-workspace-ctas">
                      {view === "reviews" && (
                        <>
                          <button
                            className="v2-button"
                            onClick={() => setEdit({ ...c })}
                          >
                            Edit review
                          </button>
                          {["REJECTED", "FLAGGED", "RETRACTED"].includes(
                            c.status,
                          ) && (
                            <button
                              className="v2-button"
                              onClick={async () => {
                                const reason = await requestText(
                                  "Explain why this moderation decision should be reviewed (10–2,000 characters)",
                                );
                                if (!reason) return;
                                try {
                                  await json(`/api/reviews/${c.id}/appeal`, {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ reason }),
                                  });
                                  notify("Appeal submitted for review");
                                  setRetry(retry + 1);
                                } catch (e) {
                                  notify(
                                    e instanceof Error
                                      ? e.message
                                      : "Unable to submit appeal",
                                  );
                                }
                              }}
                            >
                              Appeal decision
                            </button>
                          )}
                        </>
                      )}
                      <Link className="v2-button" href={`/${view}/${c.id}`}>
                        View submission <ArrowUpRight size={15} />
                      </Link>
                    </div>
                    {edit?.id === c.id && (
                      <form
                        className="v2-form-stack"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setBusy(true);
                          try {
                            await json("/api/reviews/" + c.id, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                title: edit.title,
                                content: edit.content,
                                rating: edit.rating,
                              }),
                            });
                            setEdit(null);
                            setRetry(retry + 1);
                            notify(
                              "Changes saved. Your review will be moderated again.",
                            );
                          } catch (e) {
                            notify(
                              e instanceof Error ? e.message : "Unable to save",
                            );
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        <h3>Edit review</h3>
                        <p>Edits return to moderation before publication.</p>
                        <label>
                          Title
                          <input
                            required
                            minLength={2}
                            maxLength={150}
                            value={edit.title}
                            onChange={(e) =>
                              setEdit({ ...edit, title: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Rating
                          <select
                            value={edit.rating}
                            onChange={(e) =>
                              setEdit({
                                ...edit,
                                rating: Number(e.target.value),
                              })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}/5
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Review
                          <textarea
                            required
                            minLength={5}
                            maxLength={2000}
                            value={edit.content}
                            onChange={(e) =>
                              setEdit({ ...edit, content: e.target.value })
                            }
                          />
                        </label>
                        <div>
                          <button
                            className="v2-button v2-button-primary"
                            disabled={busy}
                          >
                            Save for moderation
                          </button>{" "}
                          <button
                            className="v2-button"
                            type="button"
                            onClick={() => setEdit(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                ))
              )}
              <div className="v2-pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <span>
                  Page {page} of {Math.max(1, pages)}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
