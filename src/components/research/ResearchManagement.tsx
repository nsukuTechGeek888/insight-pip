"use client";
import { useEffect, useState } from "react";
import { Plus, FileCheck2, Tag } from "lucide-react";
import { notify, confirmAction } from "@/components/ui/Feedback";
type Provider = { id: number; name: string; type: string };
type Offer = {
  id: number;
  name: string;
  description: string;
  provider: string;
  entityType: string;
  validUntil?: string;
  code?: string;
  entityId:number;
  discount?:string;
  regions:string[];
  restrictedRegions:string[];
};
type Source = {
  id: string;
  entityType: string;
  entityId: number;
  category: string;
  label: string;
  url: string;
  verifiedAt?: string;
  note?:string;
};
export default function ResearchManagement() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [kind, setKind] = useState("offer");
  const [provider, setProvider] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Company information");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59");
  const [regions, setRegions] = useState("GLOBAL");
  const [restricted, setRestricted] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [show, setShow] = useState(false);const [editing,setEditing]=useState<string|number|null>(null);
  function beginEdit(record:Offer|Source){const isOffer='name' in record;setKind(isOffer?'offer':'source');setEditing(record.id);setProvider(record.entityType+'-'+record.entityId);setTitle(isOffer?record.name:record.label);setDescription(isOffer?record.description:record.note||'');if(isOffer){setCode(record.code||'');setDiscount(record.discount||'');setRegions(record.regions.join(','));setRestricted(record.restrictedRegions.join(','));}else{setUrl(record.url);setCategory(record.category);}const timestamp=isOffer?record.validUntil:record.verifiedAt;if(timestamp){const local=new Date(timestamp);setDate(`${local.getFullYear()}-${String(local.getMonth()+1).padStart(2,'0')}-${String(local.getDate()).padStart(2,'0')}`);setTime(local.toTimeString().slice(0,5));}else setDate('');setShow(true);window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}

  useEffect(() => {
    fetch("/api/admin/research")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setProviders(d.providers);
        setOffers(d.offers);
        setSources(d.sources);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [retry]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const selected = providers.find((p) => p.type + "-" + p.id === provider);
    if (!selected) {
      setError("Choose a provider");
      setBusy(false);
      return;
    }
    try {
      const timestamp = date ? new Date(date + "T" + time).toISOString() : null;
      const body =
        kind === "source"
          ? {
              kind,
              entityType: selected.type,
              entityId: selected.id,
              category,
              label: title,
              url,
              verifiedAt: timestamp,
              note: description,
            }
          : {
              kind,
              entityType: selected.type,
              entityId: selected.id,
              name: title,
              description,
              code,
              discount,
              validUntil: timestamp,
              regions: regions
                .split(",")
                .map((s) => s.trim().toUpperCase())
                .filter(Boolean),
              restrictedRegions: restricted
                .split(",")
                .map((s) => s.trim().toUpperCase())
                .filter(Boolean),
            };
      const r = await fetch("/api/admin/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...body,id:editing}),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setShow(false);
      setTitle("");
      setDescription("");
      setCode("");
      setUrl("");
      setDate("");
      setRetry(retry + 1);
      notify("Research record saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">RESEARCH OPERATIONS</span>
        <h1>Useful offers. Traceable information.</h1>
        <p>
          Manage provider promotions and attach source references to the claims
          traders rely on.
        </p>
      </header>
      <div className="v2-community-actions">
        <div className="v2-tabs">
          <button
            aria-pressed={kind === "offer"}
            onClick={() => {
              setKind("offer");
              setShow(false);
            }}
          >
            Offers · {offers.length}
          </button>
          <button
            aria-pressed={kind === "source"}
            onClick={() => {
              setKind("source");
              setShow(false);
            }}
          >
            Sources · {sources.length}
          </button>
        </div>
        <button
          className="v2-button v2-button-primary"
          onClick={() => {setEditing(null);setTitle("");setDescription("");setCode("");setUrl("");setDate("");setShow(!show);}}
        >
          <Plus size={16} />
          Add {kind}
        </button>
      </div>
      {error && (
        <p className="v2-error" role="alert">
          {error}
        </p>
      )}
      {show && (
        <section className="v2-panel v2-profile-section">
          <h2>
            Add {kind === "offer" ? "provider promotion" : "source reference"}
          </h2>
          <form className="v2-form-stack" onSubmit={submit}>
            <label>
              Provider
              <select
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="">Select provider</option>
                {providers.map((p) => (
                  <option key={p.type + "-" + p.id} value={p.type + "-" + p.id}>
                    {p.name} · {p.type === "brokers" ? "Broker" : "Prop firm"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {kind === "source" ? "Reference label" : "Offer title"}
              <input
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              {kind === "source"
                ? "Verification notes"
                : "Full terms, eligibility & affiliate disclosure"}
              <textarea
                rows={4}
                required={kind === "offer"}
                minLength={kind === "offer" ? 10 : 0}
                maxLength={kind === "offer" ? 4000 : 2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            {kind === "source" ? (
              <>
                <label>
                  Source category
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {[
                      "Company information",
                      "Regulation",
                      "Trading conditions",
                      "Program rules",
                      "Payout policy",
                      "Regional eligibility",
                      "Offer terms",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Source URL
                  <input
                    required
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Offer code
                  <input
                    maxLength={100}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>
                <label>
                  Discount / pricing description
                  <input
                    maxLength={100}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </label>
                <label>
                  Available region codes (comma separated)
                  <input
                    required
                    value={regions}
                    onChange={(e) => setRegions(e.target.value)}
                  />
                </label>
                <label>
                  Restricted region codes
                  <input
                    value={restricted}
                    onChange={(e) => setRestricted(e.target.value)}
                  />
                </label>
              </>
            )}
            <div className="v2-settings-grid">
              <label>
                {kind === "offer"
                  ? "Expiry date"
                  : "Date independently checked (optional)"}
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                Local time
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </label>
            </div>
            <small>
              {kind === "source"
                ? "Leave the date empty if you have not checked the source."
                : "Leave the date empty if the expiry has not been confirmed."}{" "}
              Dates are interpreted in your device’s time zone.
            </small>
            <div>
              <button className="v2-button v2-button-primary" disabled={busy}>
                Save {kind}
              </button>{" "}
              <button
                type="button"
                className="v2-button"
                onClick={() => setShow(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      <div className="v2-provider-grid">
        {kind === "offer"
          ? offers.map((o) => (
              <article
                className="v2-provider-card"
                key={o.entityType + "-" + o.id}
              >
                <Tag />
                <span className="v2-eyebrow">{o.provider}</span>
                <h2>{o.name}</h2>
                <p>{o.description}</p>
                <small>
                  {o.validUntil
                    ? "Expires " + new Date(o.validUntil).toLocaleString()
                    : "Expiry unconfirmed"}
                </small>
                {o.code && <code>{o.code}</code>}
              <button className="v2-button" onClick={()=>beginEdit(o)}>Edit offer</button>
                <button
                  className="v2-button"
                  onClick={async () => {
                    if (
                      !(await confirmAction(
                        "Expire this offer so it no longer appears publicly?",
                      ))
                    )
                      return;
                    const r = await fetch(
                      `/api/admin/research?kind=offer&type=${o.entityType}&id=${o.id}`,
                      { method: "DELETE" },
                    );
                    if (r.ok) setRetry(retry + 1);
                    else notify("Unable to expire offer");
                  }}
                >
                  Expire offer
                </button>
              </article>
            ))
          : sources.map((s) => (
              <article className="v2-provider-card" key={s.id}>
                <FileCheck2 />
                <span className="v2-eyebrow">{s.category}</span>
                <h2>{s.label}</h2>
                <p>
                  {
                    providers.find(
                      (p) => p.type === s.entityType && p.id === s.entityId,
                    )?.name
                  }
                </p>
                <button className="v2-button" onClick={()=>beginEdit(s)}>Edit source</button>
                <a href={s.url} target="_blank" rel="noreferrer">
                  Open reference
                </a>
                <small>
                  {s.verifiedAt
                    ? "Checked " + new Date(s.verifiedAt).toLocaleDateString()
                    : "Not independently checked"}
                </small>
                <button
                  className="v2-button"
                  onClick={async () => {
                    if (
                      !(await confirmAction(
                        "Remove this source reference? The change will be audited.",
                      ))
                    )
                      return;
                    const r = await fetch(
                      "/api/admin/research?kind=source&id=" + s.id,
                      { method: "DELETE" },
                    );
                    if (r.ok) setRetry(retry + 1);
                    else notify("Unable to remove source");
                  }}
                >
                  Remove reference
                </button>
              </article>
            ))}
      </div>
      {(kind === "offer" ? !offers.length : !sources.length) && !error && (
        <div className="v2-panel v2-state">
          <FileCheck2 />
          <h2>No records yet</h2>
          <p>Add a provider-associated {kind} using the form above.</p>
        </div>
      )}
    </div>
  );
}
