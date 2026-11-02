"use client";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Search,
  FileText,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { confirmAction, notify } from "@/components/ui/Feedback";
type Evidence = {
  id: string;
  originalName: string;
  mimeType: string;
  status: string;
};
type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  moderationNote?: string;
  isVerified: boolean;
  isHidden: boolean;
  user: { name: string; email: string };
  broker?: { name: string };
  propFirm?: { name: string };
  evidence: Evidence[];
  reports: { id: string; reason: string; details: string }[];
  createdAt: string;
};
type Appeal = {
  id: string;
  reason: string;
  review: { title: string; content: string; rating: number };
  user: { name: string };
  createdAt: string;
};
export default function ModerationCenter() {
  const [replies, setReplies] = useState<
    {
      id: string;
      content: string;
      replyType: string;
      review: { title: string };
      user: { name: string };
    }[]
  >([]);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [total, setTotal] = useState(0);
  const [reports, setReports] = useState(0);
  const [active, setActive] = useState<Review | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    fetch(
      `/api/admin/moderation?${new URLSearchParams({ tab, search: query, page: String(page) })}`,
      { signal: c.signal },
    )
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setReviews(d.reviews);
        setReplies(d.replies || []);
        setAppeals(d.appeals);
        setTotal(d.total);
        setReports(d.pendingReports);
        setPages(d.pages);
        setSelected([]);
        setActive(null);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => c.abort();
  }, [tab, query, page, retry]);
  async function action(id: string, action: string, reason = note) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, note: reason }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save decision");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function decision(id: string, kind: string) {
    if (
      !(await confirmAction(
        `Apply “${kind.replaceAll("-", " ")}” to this submission? The decision will be recorded in the audit history.`,
      ))
    )
      return;
    if (await action(id, kind)) {
      setRetry(retry + 1);
      setNote("");
    }
  }
  return (
    <div>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">TRUST OPERATIONS</span>
        <h1>Every experience deserves fair review.</h1>
        <p>
          Inspect context and private evidence. Record a reason. Apply the same
          standards to positive and critical reviews.
        </p>
      </header>
      <div className="v2-community-actions">
        <div className="v2-tabs">
          {[
            ["pending", "Pending reviews"],
            ["reported", `Reported · ${reports}`],
            ["appeals", `Appeals · ${appeals.length}`],
            ["replies", `Replies · ${replies.length}`],
            ["all", "All reviews"],
          ].map(([v, l]) => (
            <button
              key={v}
              aria-pressed={tab === v}
              onClick={() => {
                setTab(v);
                setPage(1);
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="v2-search">
          <Search size={17} />
          <input
            aria-label="Search moderation queue"
            placeholder="Search review or trader…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <div className="v2-error" role="alert">
          {error}
          <button onClick={() => setRetry(retry + 1)}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      )}
      {loading ? (
        <div className="v2-state" role="status">
          Loading moderation queue…
        </div>
      ) : tab === "replies" ? (
        <div>
          {replies.length ? (
            replies.map((r) => (
              <article className="v2-panel v2-contribution" key={r.id}>
                <span className="v2-status">{r.replyType} RESPONSE</span>
                <h2>{r.review.title}</h2>
                <small>{r.user.name}</small>
                <p>{r.content}</p>
                <label className="v2-form-stack">
                  Moderation note
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                <div className="v2-workspace-ctas">
                  <button
                    className="v2-button"
                    disabled={busy}
                    onClick={() => void decision(r.id, "approve-reply")}
                  >
                    Approve reply
                  </button>
                  <button
                    className="v2-button"
                    disabled={busy}
                    onClick={() => void decision(r.id, "reject-reply")}
                  >
                    Reject reply
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="v2-panel v2-state">No pending replies.</div>
          )}
        </div>
      ) : tab === "appeals" ? (
        <div>
          {appeals.length ? (
            appeals.map((a) => (
              <article className="v2-panel v2-contribution" key={a.id}>
                <span className="v2-status">APPEAL AWAITING REVIEW</span>
                <h2>{a.review.title}</h2>
                <small>
                  {a.user.name} · {new Date(a.createdAt).toLocaleString()}
                </small>
                <blockquote>{a.review.content}</blockquote>
                <h3>Trader’s appeal</h3>
                <p>{a.reason}</p>
                <label className="v2-form-stack">
                  Decision note
                  <textarea
                    aria-label={"Appeal decision note " + a.id}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={2000}
                  />
                </label>
                <div className="v2-workspace-ctas">
                  <button
                    className="v2-button"
                    disabled={busy}
                    onClick={() => void decision(a.id, "accept-appeal")}
                  >
                    Reopen for moderation
                  </button>
                  <button
                    className="v2-button"
                    disabled={busy}
                    onClick={() => void decision(a.id, "reject-appeal")}
                  >
                    Decline appeal
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="v2-panel v2-state">
              <ShieldCheck />
              <h2>No pending appeals</h2>
              <p>Submitted appeals appear here for a separate decision.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="v2-section-title">
            <p>{total} matching reviews</p>
            {selected.length > 0 && (
              <button
                disabled={busy}
                className="v2-button"
                onClick={async () => {
                  if (
                    !(await confirmAction(
                      `Approve ${selected.length} selected reviews? Use this only after inspecting every selected submission.`,
                    ))
                  )
                    return;
                  let count = 0;
                  for (const id of selected) {
                    if (
                      !(await action(
                        id,
                        "approve",
                        "Approved after moderation review",
                      ))
                    )
                      break;
                    count++;
                  }
                  notify(`${count} review decisions saved`);
                  setRetry(retry + 1);
                }}
              >
                Approve {selected.length} selected
              </button>
            )}
          </div>
          <div className="v2-moderation-layout">
            <div className="v2-panel v2-queue">
              {reviews.length ? (
                reviews.map((r) => (
                  <div
                    className={
                      active?.id === r.id
                        ? "v2-queue-row active"
                        : "v2-queue-row"
                    }
                    key={r.id}
                  >
                    <input
                      aria-label={"Select " + r.title}
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, r.id]
                            : selected.filter((x) => x !== r.id),
                        )
                      }
                    />
                    <button
                      onClick={() => {
                        setActive(r);
                        setNote(r.moderationNote || "");
                      }}
                    >
                      <span className="v2-status">
                        {r.status}
                        {r.isHidden ? " · HIDDEN" : ""}
                      </span>
                      <h3>{r.title}</h3>
                      <small>
                        {r.broker?.name || r.propFirm?.name} · {r.rating}/5
                      </small>
                      <small>
                        {r.user.name || r.user.email} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </small>
                      <span>
                        {r.evidence.length} evidence files · {r.reports.length}{" "}
                        open reports
                      </span>
                    </button>
                    <ChevronRight size={16} />
                  </div>
                ))
              ) : (
                <div className="v2-state">
                  <ShieldCheck />
                  <h3>Queue is clear</h3>
                  <p>New submissions and reports will appear here.</p>
                </div>
              )}
            </div>
            <aside className="v2-panel v2-inspection">
              {active ? (
                <>
                  <span className="v2-eyebrow">SUBMISSION INSPECTION</span>
                  <h2>{active.title}</h2>
                  <p className="v2-inspection-copy">{active.content}</p>
                  <dl className="v2-fact-list">
                    <div>
                      <dt>Trader</dt>
                      <dd>
                        {active.user.name}
                        <br />
                        {active.user.email}
                      </dd>
                    </div>
                    <div>
                      <dt>Rating</dt>
                      <dd>{active.rating}/5</dd>
                    </div>
                    <div>
                      <dt>Trading experience</dt>
                      <dd>
                        {active.isVerified
                          ? "Independently verified"
                          : "Not independently verified"}
                      </dd>
                    </div>
                  </dl>
                  <h3>Private evidence</h3>
                  <p className="v2-form-note">
                    Opening a file is audited. Evidence submission alone does
                    not verify trading experience.
                  </p>
                  {active.evidence.length ? (
                    active.evidence.map((f) => (
                      <div className="v2-evidence-inspect" key={f.id}>
                        {f.mimeType.startsWith("image/") && (
                          <a
                            href={`/api/evidence/${f.id}?preview=1`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={`/api/evidence/${f.id}?preview=1`}
                              alt={
                                "Private supporting evidence: " + f.originalName
                              }
                            />
                          </a>
                        )}
                        <a
                          href={"/api/evidence/" + f.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText size={16} />
                          {f.originalName}
                          <ExternalLink size={13} />
                        </a>
                        <small>{f.status}</small>
                        {f.status !== "REVIEWED" && (
                          <button
                            disabled={busy}
                            className="v2-button"
                            onClick={async () => {
                              if (await action(f.id, "evidence-reviewed"))
                                setActive({
                                  ...active,
                                  evidence: active.evidence.map((e) =>
                                    e.id === f.id
                                      ? { ...e, status: "REVIEWED" }
                                      : e,
                                  ),
                                });
                            }}
                          >
                            Mark evidence reviewed
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No private evidence submitted.</p>
                  )}
                  {active.reports.length > 0 && (
                    <>
                      <h3>Open reports</h3>
                      {active.reports.map((r) => (
                        <div className="v2-notice" key={r.id}>
                          <div>
                            <strong>{r.reason}</strong>
                            <p>{r.details}</p>
                            <button
                              className="v2-button"
                              disabled={busy}
                              onClick={() =>
                                void decision(r.id, "resolve-report")
                              }
                            >
                              Resolve report with note
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  <label className="v2-form-stack">
                    Moderation note
                    <textarea
                      maxLength={2000}
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Record the facts checked and reason for the decision."
                    />
                  </label>
                  <div className="v2-workspace-ctas">
                    <button
                      className="v2-button v2-button-primary"
                      disabled={busy}
                      onClick={() => void decision(active.id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="v2-button"
                      disabled={busy}
                      onClick={() => void decision(active.id, "reject")}
                    >
                      Reject with reason
                    </button>
                    <button
                      className="v2-button"
                      disabled={busy}
                      onClick={() =>
                        void decision(
                          active.id,
                          active.isHidden ? "unhide" : "hide",
                        )
                      }
                    >
                      {active.isHidden
                        ? "Restore visibility"
                        : "Hide for investigation"}
                    </button>
                    <button
                      className="v2-button"
                      disabled={busy || active.isVerified}
                      onClick={() =>
                        void decision(active.id, "verify-experience")
                      }
                    >
                      Verify trading experience
                    </button>
                  </div>
                  <p className="v2-form-note">
                    Verification requires reviewed supporting evidence and a
                    documented independent check.
                  </p>
                </>
              ) : (
                <div className="v2-state">
                  <ShieldCheck size={32} />
                  <h2>Select a review</h2>
                  <p>
                    Inspect the submission, evidence and reports before making a
                    decision.
                  </p>
                </div>
              )}
            </aside>
          </div>
          <div className="v2-pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.max(1, pages)}
            </span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
