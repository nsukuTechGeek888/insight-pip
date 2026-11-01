"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Star,
  Save,
  Trash2,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useRegion } from "@/contexts/RegionContext";
import { confirmAction } from "@/components/ui/Feedback";
const empty = {
  type: "brokers",
  provider: "",
  providerName: "",
  title: "",
  content: "",
  rating: 0,
  platformStability: 0,
  executionQuality: 0,
  withdrawalExperience: 0,
  customerSupport: 0,
  reliability: 0,
  incidentType: "WITHDRAWAL_DELAY",
  incidentDate: "",
};
type Draft = typeof empty;
type Provider = { id: number; name: string };
export default function WriteExperience({
  incident = false,
}: {
  incident?: boolean;
}) {
  const [draft, setDraft] = useState<Draft>(empty);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [lookupError, setLookupError] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useUser();
  const { region } = useRegion();
  const router = useRouter();
  const key = `insightpip-draft-${incident ? "incident" : "review"}-v2`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const value = JSON.parse(raw);
        if (value && typeof value === "object") {
          const valid = Object.fromEntries(
            Object.entries(empty).map(([k, v]) => [
              k,
              typeof value[k] === typeof v ? value[k] : v,
            ]),
          );
          setDraft(valid as Draft);
        }
      }
    } catch {
      /* Storage may be disabled. */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready || done) return;
    setSaved(false);
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(draft));
        setSaved(true);
      } catch {
        setSaved(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [draft, key, ready, done]);
  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(() => {
      setLookupError(false);
      fetch(
        `/api/research/providers?${new URLSearchParams({ type: draft.type, region, search, limit: "50" })}`,
        { signal: c.signal },
      )
        .then(async (r) => {
          if (!r.ok) throw Error();
          const d = await r.json();
          setProviders(d.data);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setLookupError(true);
        });
    }, 200);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [draft.type, region, search]);
  function update<K extends keyof Draft>(k: K, v: Draft[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent("/reviews/write" + (incident ? "?kind=incident" : ""))}`,
      );
      return;
    }
    setError("");
    if (!draft.provider) {
      setError("Select a provider before submitting.");
      return;
    }
    if (!incident && !draft.rating) {
      setError("Choose an overall rating.");
      return;
    }
    if (incident && !draft.incidentDate) {
      setError("Choose the date of the incident.");
      return;
    }
    setBusy(true);
    try {
      const body = incident
        ? {
            entityType: draft.type === "brokers" ? "broker" : "propFirm",
            entityId: Number(draft.provider),
            incidentType: draft.incidentType,
            title: draft.title,
            description: draft.content,
            incidentDate: new Date(draft.incidentDate).toISOString(),
          }
        : {
            ...draft,
            [draft.type === "brokers" ? "brokerId" : "propFirmId"]: Number(
              draft.provider,
            ),
            verifiedTrader: false,
          };
      const r = await fetch(`/api/${incident ? "incidents" : "reviews"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Submission could not be saved.");
      setDone(true);
      localStorage.removeItem(key);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to submit your experience.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <div className="v2-container v2-state">
        <CheckCircle2 size={45} />
        <h1>Submitted for review.</h1>
        <p>
          Your experience has been received. Follow its moderation status in
          your workspace.
        </p>
        <Link
          className="v2-button"
          href={incident ? "/dashboard/incidents" : "/dashboard/reviews"}
        >
          View your submissions
        </Link>
      </div>
    );
  return (
    <div className="v2-container">
      <header className="v2-page-heading">
        <Link className="v2-back" href={incident ? "/incidents" : "/reviews"}>
          <ArrowLeft size={15} />
          Back to {incident ? "incidents" : "reviews"}
        </Link>
        <span className="v2-eyebrow">SHARE YOUR EXPERIENCE</span>
        <h1>
          {incident
            ? "Report an incident."
            : "Help another trader make a better choice."}
        </h1>
        <p>
          Describe your own experience clearly. Be specific, fair and factual.
          Your submission will be reviewed before publication.
        </p>
      </header>
      <div className="v2-community-grid">
        <form className="v2-compose v2-panel" onSubmit={submit}>
          <div className="v2-compose-header">
            <span>
              <Save size={15} />
              {saved ? "Draft saved on this device" : "Draft not yet saved"}
            </span>
            <button
              type="button"
              onClick={async () => {
                if (await confirmAction("Clear this draft from this device?")) {
                  setDraft(empty);
                  localStorage.removeItem(key);
                }
              }}
            >
              <Trash2 size={14} />
              Clear draft
            </button>
          </div>
          <fieldset>
            <legend>01 / Choose a provider</legend>
            <div className="v2-field-grid">
              <label>
                Provider type
                <select
                  value={draft.type}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      type: e.target.value,
                      provider: "",
                      providerName: "",
                    }))
                  }
                >
                  <option value="brokers">Broker</option>
                  <option value="prop-firms">Prop firm</option>
                </select>
              </label>
              <label>
                Search providers
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Start typing a name"
                />
              </label>
            </div>
            <label>
              Provider
              <select
                required
                value={draft.provider}
                onChange={(e) => {
                  const p = providers.find(
                    (p) => String(p.id) === e.target.value,
                  );
                  setDraft((d) => ({
                    ...d,
                    provider: e.target.value,
                    providerName: p?.name || "",
                  }));
                }}
              >
                <option value="">Select a provider</option>
                {draft.provider &&
                  !providers.some((p) => String(p.id) === draft.provider) && (
                    <option value={draft.provider}>{draft.providerName}</option>
                  )}
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {lookupError && (
              <p className="v2-form-note" role="status">
                Provider lookup is unavailable. You can keep writing and return
                when the connection is restored.
              </p>
            )}
          </fieldset>
          <fieldset>
            <legend>
              02 / {incident ? "What happened?" : "Rate your experience"}
            </legend>
            {incident ? (
              <div className="v2-field-grid">
                <label>
                  Issue type
                  <select
                    value={draft.incidentType}
                    onChange={(e) => update("incidentType", e.target.value)}
                  >
                    {[
                      "WITHDRAWAL_DELAY",
                      "WITHDRAWAL_REJECTED",
                      "ACCOUNT_SUSPENDED",
                      "RULE_VIOLATION_DISPUTE",
                      "PLATFORM_FREEZE",
                      "OTHER",
                    ].map((v) => (
                      <option key={v} value={v}>
                        {v.replaceAll("_", " ").toLowerCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Incident date
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    value={draft.incidentDate}
                    onChange={(e) => update("incidentDate", e.target.value)}
                  />
                </label>
              </div>
            ) : (
              <>
                <Rating
                  label="Overall rating"
                  value={draft.rating}
                  change={(v) => update("rating", v)}
                />
                <p className="v2-form-note">
                  Category ratings are optional. Leave a category unrated if you
                  haven’t used that service.
                </p>
                {(
                  [
                    ["platformStability", "Platform stability"],
                    ["executionQuality", "Trade execution"],
                    [
                      "withdrawalExperience",
                      draft.type === "brokers"
                        ? "Withdrawals"
                        : "Payout experience",
                    ],
                    ["customerSupport", "Customer support"],
                    ["reliability", "Reliability"],
                  ] as const
                ).map(([key, label]) => (
                  <Rating
                    key={key}
                    label={label}
                    value={draft[key]}
                    change={(v) => update(key, v)}
                  />
                ))}
              </>
            )}
          </fieldset>
          <fieldset>
            <legend>03 / Tell your story</legend>
            <label>
              Title
              <input
                required
                minLength={3}
                maxLength={100}
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Summarise your experience"
              />
            </label>
            <label>
              {incident ? "Incident description" : "Your review"}
              <textarea
                required
                minLength={20}
                maxLength={2000}
                rows={8}
                value={draft.content}
                onChange={(e) => update("content", e.target.value)}
                placeholder="What happened? What worked well? What could improve? Include relevant dates without sharing personal account details."
              />
            </label>
            <small className="v2-character-count">
              {draft.content.length} / 2,000 characters
            </small>
            <p className="v2-form-note">
              Do not include passwords, account numbers or identity documents.
              Private evidence upload is not available in this submission form.
            </p>
          </fieldset>
          {error && (
            <div className="v2-error" role="alert">
              {error}
            </div>
          )}
          <div className="v2-compose-submit">
            <p>
              {user
                ? "Submitted experiences enter moderation."
                : "You can write now. Sign in to submit; your draft stays on this device."}
            </p>
            <button className="v2-button" type="submit" disabled={busy}>
              {busy
                ? "Submitting…"
                : user
                  ? "Submit for moderation"
                  : "Sign in to submit"}
            </button>
          </div>
        </form>
        <aside className="v2-community-aside">
          <ShieldCheck size={28} />
          <h2>Useful. Fair. Your own.</h2>
          <h3>Write from experience</h3>
          <p>
            Only review a provider you have used. Describe your account or
            program where relevant.
          </p>
          <h3>Keep private details private</h3>
          <p>
            This draft is stored in this browser. Clear it when using a shared
            device.
          </p>
          <h3>Verification is separate</h3>
          <p>
            Submitting a review or confirming an email does not verify trading
            experience.
          </p>
          <Link href="/methodology">Read our transparency principles</Link>
        </aside>
      </div>
    </div>
  );
}
function Rating({
  label,
  value,
  change,
}: {
  label: string;
  value: number;
  change: (v: number) => void;
}) {
  return (
    <div className="v2-rating-field">
      <span>{label}</span>
      <div role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            type="button"
            key={v}
            aria-label={`${label}: ${v} out of 5`}
            aria-pressed={value === v}
            onClick={() => change(value === v ? 0 : v)}
            className={v <= value ? "selected" : ""}
          >
            <Star size={21} fill={v <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    </div>
  );
}
