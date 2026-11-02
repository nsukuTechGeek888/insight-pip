"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ShieldCheck, ArrowLeft, Paperclip } from "lucide-react";
import { notify } from "@/components/ui/Feedback";
type Incident = {
  id: string;
  title: string;
  description: string;
  incidentType: string;
  incidentDate: string;
  reportDate: string;
  resolutionStatus: string;
  status: string;
  confirmations: number;
  disputes: number;
  verifiedBadge: boolean;
  moderationNote?: string;
  user: { name: string };
  entity: { name: string; slug: string };
  entityType: string;
  canManage: boolean;
  updates: {
    id: string;
    content: string;
    authorType: string;
    approved: boolean;
    createdAt: string;
  }[];
  evidence: { id: string; originalName: string; status: string }[];
  legacyEvidence: { url: string; label: string }[];
};
export default function IncidentDetail({ id }: { id: string }) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [update, setUpdate] = useState("");
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/incidents/" + id, { signal: c.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setIncident(d.incident);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [id, retry]);
  if (error)
    return (
      <div className="v2-container v2-state">
        <Activity />
        <h1>Report unavailable</h1>
        <p>{error}</p>
        <Link href="/incidents">Back to incident centre</Link>
      </div>
    );
  if (!incident)
    return (
      <div className="v2-state" role="status">
        Loading incident report…
      </div>
    );
  const i = incident;
  return (
    <div className="v2-container v2-incident-detail">
      <Link className="v2-back" href="/incidents">
        <ArrowLeft size={15} />
        Incident centre
      </Link>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">INCIDENT REPORT · {i.status}</span>
        <h1>{i.title}</h1>
        <p>
          {i.entity?.name} · {i.incidentType.replaceAll("_", " ")}
        </p>
      </header>
      <div className="v2-profile-columns">
        <article className="v2-panel v2-profile-section">
          <span className="v2-status">
            {i.verifiedBadge ? "CONFIRMED BY MODERATOR" : "TRADER ALLEGATION"}
          </span>
          <h2>Reported experience</h2>
          <p className="v2-profile-description">{i.description}</p>
          <dl className="v2-fact-list">
            <div>
              <dt>Reported by</dt>
              <dd>{i.user.name || "Trader"}</dd>
            </div>
            <div>
              <dt>Incident date</dt>
              <dd>{new Date(i.incidentDate).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Report date</dt>
              <dd>{new Date(i.reportDate).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Resolution status</dt>
              <dd>{i.resolutionStatus}</dd>
            </div>
          </dl>
          {i.moderationNote && (
            <div className="v2-notice">
              <div>
                <h3>Private moderation note</h3>
                <p>{i.moderationNote}</p>
              </div>
            </div>
          )}
          {(i.evidence.length > 0 || i.legacyEvidence.length > 0) && (
            <section className="v2-evidence">
              <h3>
                <ShieldCheck size={18} /> Your private evidence
              </h3>
              <p>
                These files are available only to the submitting trader and
                authorised moderators.
              </p>
              {i.evidence.map((f) => (
                <p key={f.id}>
                  <a
                    href={"/api/evidence/" + f.id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {f.originalName}
                  </a>{" "}
                  · {f.status}
                </p>
              ))}
              {i.legacyEvidence.map((f) => (
                <p key={f.url}>
                  <a href={f.url}>{f.label}</a>
                </p>
              ))}
            </section>
          )}
          {i.canManage && (
            <label className="v2-upload">
              <Paperclip size={18} />
              {busy ? "Uploading…" : "Add private supporting evidence"}
              <input
                type="file"
                aria-label="Add incident evidence"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  const form = new FormData();
                  form.set("file", file);
                  try {
                    const r = await fetch(`/api/incidents/${id}/proof`, {
                      method: "POST",
                      body: form,
                    });
                    const d = await r.json();
                    if (!r.ok) throw Error(d.error);
                    setRetry(retry + 1);
                    notify("Evidence stored privately");
                  } catch (e) {
                    notify(e instanceof Error ? e.message : "Upload failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
          )}
          <section className="v2-evidence">
            <h2>Updates & responses</h2>
            {i.updates.length ? (
              i.updates.map((u) => (
                <article className="v2-source" key={u.id}>
                  <span className="v2-status">
                    {u.authorType.replaceAll("_", " ")}
                    {u.approved ? "" : " · AWAITING MODERATION"}
                  </span>
                  <p>{u.content}</p>
                  <small>{new Date(u.createdAt).toLocaleString()}</small>
                </article>
              ))
            ) : (
              <p>No published updates yet.</p>
            )}
            <form
              className="v2-form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const r = await fetch(`/api/incidents/${id}/updates`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: update }),
                  });
                  const d = await r.json();
                  if (!r.ok) throw Error(d.error);
                  notify(d.message);
                  setUpdate("");
                  setRetry(retry + 1);
                } catch (e) {
                  notify(
                    e instanceof Error ? e.message : "Unable to save update",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                Submit an update or provider response
                <textarea
                  minLength={10}
                  maxLength={2000}
                  required
                  value={update}
                  onChange={(e) => setUpdate(e.target.value)}
                />
              </label>
              <small>
                Available to the reporting trader, authorised provider
                representative or administrator. Updates are moderated before
                publication.
              </small>
              <button className="v2-button" disabled={busy}>
                Submit update
              </button>
            </form>
          </section>
        </article>
        <aside className="v2-panel v2-profile-section">
          <ShieldCheck size={28} />
          <h2>Understand the status.</h2>
          <p>
            Publication confirms that a report passed moderation. It does not
            confirm every allegation. Resolution and fact verification are
            separate.
          </p>
          <h3>Community responses</h3>
          <p>
            {i.confirmations} similar experiences · {i.disputes} disputed
            accounts
          </p>
          <small>
            Community responses are not evidence of independently confirmed
            facts.
          </small>
          <div className="v2-workspace-ctas">
            {[
              ["confirm", "Similar experience"],
              ["dispute", "Dispute account"],
            ].map(([path, label]) => (
              <button
                className="v2-button"
                key={path}
                disabled={busy || i.canManage || i.status !== "APPROVED"}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await fetch(`/api/incidents/${id}/${path}`, {
                      method: "POST",
                    });
                    const d = await r.json();
                    if (!r.ok) throw Error(d.error);
                    setRetry(retry + 1);
                  } catch (e) {
                    notify(
                      e instanceof Error ? e.message : "Unable to respond",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {i.entity && (
            <Link
              href={`/${i.entityType === "broker" ? "brokers" : "prop-firms"}/${i.entity.slug}`}
            >
              Research {i.entity.name}
            </Link>
          )}
          <hr />
          <Link href="/reviews/write?kind=incident">
            Submit your own report
          </Link>
        </aside>
      </div>
    </div>
  );
}
