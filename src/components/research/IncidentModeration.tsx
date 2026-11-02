"use client";
import { useEffect, useState } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import { notify, confirmAction } from "@/components/ui/Feedback";
type Incident = {
  id: string;
  title: string;
  description: string;
  incidentType: string;
  resolutionStatus: string;
  status: string;
  verifiedBadge: boolean;
  moderationNote?: string;
  user: { name: string; email: string };
  broker?: { name: string };
  propFirm?: { name: string };
  evidence: {
    id: string;
    originalName: string;
    mimeType: string;
    status: string;
  }[];
  followUps:
    | { id: string; content: string; authorType: string; approved: boolean }[]
    | null;
  createdAt: string;
};
export default function IncidentModeration() {
  const [status, setStatus] = useState("PENDING");
  const [items, setItems] = useState<Incident[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [active, setActive] = useState<Incident | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`/api/admin/incidents?page=${page}&limit=20&status=${status}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setItems(d.incidents);
        setPages(d.pagination.pages);
        setActive(null);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [status, page, retry]);
  async function decision(action: string, extra: Record<string, string> = {}) {
    if (!active) return;
    if (
      !(await confirmAction(
        "Save this incident moderation decision? It will be audited and the trader will be notified.",
      ))
    )
      return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/incidents/" + active.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note, ...extra }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setRetry(retry + 1);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">INCIDENT OPERATIONS</span>
        <h1>Investigate with care. Publish with context.</h1>
        <p>
          Keep allegations, independently confirmed facts and resolution status
          separate. Private evidence stays private.
        </p>
      </header>
      <div className="v2-tabs">
        {["PENDING", "APPROVED", "FLAGGED", "REJECTED", "all"].map((s) => (
          <button
            aria-pressed={status === s}
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {s === "all" ? "All reports" : s.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      {error && (
        <p className="v2-error" role="alert">
          {error}
        </p>
      )}
      <div className="v2-moderation-layout">
        <div className="v2-panel v2-queue">
          {items.length ? (
            items.map((i) => (
              <div
                key={i.id}
                className={
                  active?.id === i.id ? "v2-queue-row active" : "v2-queue-row"
                }
              >
                <Activity size={18} />
                <button
                  onClick={() => {
                    setActive(i);
                    setNote(i.moderationNote || "");
                  }}
                >
                  <span className="v2-status">
                    {i.status} · {i.resolutionStatus}
                  </span>
                  <h3>{i.title}</h3>
                  <small>{i.broker?.name || i.propFirm?.name}</small>
                  <small>
                    {i.user.name} · {new Date(i.createdAt).toLocaleDateString()}
                  </small>
                </button>
              </div>
            ))
          ) : (
            <div className="v2-state">
              <ShieldCheck />
              <h3>No matching incident reports</h3>
            </div>
          )}
        </div>
        <aside className="v2-panel v2-inspection">
          {active ? (
            <>
              <span className="v2-eyebrow">REPORT INSPECTION</span>
              <h2>{active.title}</h2>
              <span className="v2-status">
                {active.verifiedBadge
                  ? "CONFIRMED FACTS"
                  : "UNCONFIRMED ALLEGATION"}
              </span>
              <p className="v2-inspection-copy">{active.description}</p>
              <small>
                {active.user.name} · {active.user.email}
              </small>
              <h3>Private evidence</h3>
              {active.evidence?.length ? (
                active.evidence.map((f) => (
                  <div className="v2-evidence-inspect" key={f.id}>
                    {f.mimeType.startsWith("image/") && (
                      <img
                        src={`/api/evidence/${f.id}?preview=1`}
                        alt={"Supporting evidence " + f.originalName}
                      />
                    )}
                    <a
                      href={"/api/evidence/" + f.id}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {f.originalName}
                    </a>
                    <small>{f.status}</small>
                    <button
                      className="v2-button"
                      disabled={busy || f.status === "REVIEWED"}
                      onClick={async () => {
                        const r = await fetch("/api/admin/moderation", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: f.id,
                            action: "evidence-reviewed",
                          }),
                        });
                        if (r.ok)
                          setActive({
                            ...active,
                            evidence: active.evidence.map((e) =>
                              e.id === f.id ? { ...e, status: "REVIEWED" } : e,
                            ),
                          });
                        else notify("Unable to mark evidence reviewed");
                      }}
                    >
                      Mark reviewed
                    </button>
                  </div>
                ))
              ) : (
                <p>No private evidence submitted.</p>
              )}
              <label className="v2-form-stack">
                Investigation / moderation note
                <textarea
                  required
                  minLength={5}
                  maxLength={2000}
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <div className="v2-workspace-ctas">
                {[
                  ["approve", "Publish report"],
                  ["reject", "Reject"],
                  ["flag", "Flag for investigation"],
                  ["verify", "Confirm independently checked facts"],
                  ["resolve", "Mark resolved"],
                ].map(([a, l]) => (
                  <button
                    className="v2-button"
                    key={a}
                    disabled={busy}
                    onClick={() => void decision(a)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <label className="v2-form-stack">Incident classification<select value={active.incidentType} onChange={e=>setActive({...active,incidentType:e.target.value})}>{[...new Set([active.incidentType,'WITHDRAWAL_DELAY','WITHDRAWAL_REJECTED','ACCOUNT_SUSPENDED','RULE_VIOLATION_DISPUTE','PLATFORM_FREEZE','SERVER_DOWN','OTHER'])].map(type=><option key={type} value={type}>{type.replaceAll('_',' ')}</option>)}</select></label><button className="v2-button" disabled={busy} onClick={()=>void decision('classify',{incidentType:active.incidentType})}>Save classification</button>
<label className="v2-form-stack">
                Resolution status
                <select
                  value={active.resolutionStatus}
                  onChange={(e) =>
                    setActive({ ...active, resolutionStatus: e.target.value })
                  }
                >
                  {["PENDING", "CONFIRMED", "DISPUTED", "RESOLVED"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button
                className="v2-button"
                disabled={busy}
                onClick={() =>
                  void decision("resolution", {
                    resolutionStatus: active.resolutionStatus,
                  })
                }
              >
                Save resolution status
              </button>
              {Array.isArray(active.followUps) &&
                active.followUps.length > 0 && (
                  <>
                    <h3>Updates & provider responses</h3>
                    {active.followUps.map((u) => (
                      <article className="v2-source" key={u.id}>
                        <span className="v2-status">
                          {u.authorType} ·{" "}
                          {u.approved ? "PUBLISHED" : "PENDING"}
                        </span>
                        <p>{u.content}</p>
                        {!u.approved && (
                          <button
                            className="v2-button"
                            disabled={busy}
                            onClick={() =>
                              void decision("approve-update", {
                                updateId: u.id,
                              })
                            }
                          >
                            Approve update
                          </button>
                        )}
                      </article>
                    ))}
                  </>
                )}
            </>
          ) : (
            <div className="v2-state">
              <Activity size={30} />
              <h2>Select a report</h2>
              <p>
                Review the description, evidence and responses before taking
                action.
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
    </div>
  );
}
