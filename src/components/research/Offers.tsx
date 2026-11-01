"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, Copy, ArrowUpRight, RefreshCw } from "lucide-react";
import { useRegion } from "@/contexts/RegionContext";
import { notify } from "@/components/ui/Feedback";
type Offer = {
  id: string;
  provider: string;
  slug: string;
  type: string;
  title: string;
  description?: string;
  discount?: string;
  code?: string;
  expires?: string;
};
export default function Offers() {
  const { region } = useRegion();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [status, setStatus] = useState("loading");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setStatus("loading");
    fetch(`/api/research/offers?region=${region}`, { signal: c.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        setOffers(d.offers);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => c.abort();
  }, [region, retry]);
  const results = offers.filter(
    (o) =>
      (type === "all" || o.type === type) &&
      `${o.title} ${o.provider}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="v2-container">
      <header className="v2-page-heading">
        <span className="v2-eyebrow">OPPORTUNITIES, WITH CONTEXT</span>
        <h1>An offer is only as good as its terms.</h1>
        <p>
          Explore available promotions alongside provider research. Confirm
          current pricing, eligibility and expiry dates before signing up.
        </p>
      </header>
      <div className="v2-community-actions">
        <div className="v2-tabs">
          {[
            ["all", "All offers"],
            ["brokers", "Brokers"],
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
        </div>
        <input
          className="v2-offer-search"
          aria-label="Search offers"
          placeholder="Search provider or offer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <p className="v2-form-note">
        Commercial disclosure: provider links may involve affiliate
        compensation. Listing an offer does not endorse the provider. Source
        verification is not yet confirmed for these records.
      </p>
      {status === "loading" ? (
        <div className="v2-state" role="status">
          Loading current offers…
        </div>
      ) : status === "error" ? (
        <div className="v2-panel v2-state">
          <RefreshCw size={28} />
          <h3>Offers are unavailable right now</h3>
          <p>Please retry the connection.</p>
          <button className="v2-button" onClick={() => setRetry(retry + 1)}>
            Try again
          </button>
        </div>
      ) : results.length ? (
        <div className="v2-provider-grid">
          {results.map((o) => (
            <article key={o.id} className="v2-provider-card">
              <div className="v2-card-top">
                <Tag size={24} />
                <span>
                  {o.type === "brokers" ? "BROKER OFFER" : "PROP FIRM OFFER"}
                </span>
              </div>
              <h2>{o.title}</h2>
              <Link href={`/${o.type}/${o.slug}`} className="v2-offer-provider">
                {o.provider}
                <ArrowUpRight size={15} />
              </Link>
              <p>
                {o.description ||
                  "Full eligibility and offer terms have not been provided. Check with the provider before use."}
              </p>
              {o.discount && <strong>{o.discount}</strong>}
              <dl>
                <div>
                  <dt>Expires</dt>
                  <dd>
                    {o.expires && Number.isFinite(Date.parse(o.expires))
                      ? new Date(o.expires).toLocaleDateString()
                      : "Not confirmed"}
                  </dd>
                </div>
                <div>
                  <dt>Source verification</dt>
                  <dd>Not confirmed</dd>
                </div>
              </dl>
              {o.code && (
                <button
                  className="v2-code"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(o.code!);
                      notify(
                        "Offer code copied. Check eligibility and terms before use.",
                      );
                    } catch {
                      notify(`Offer code: ${o.code}`);
                    }
                  }}
                >
                  <code>{o.code}</code>
                  <Copy size={15} />
                </button>
              )}
              <div className="v2-card-footer">
                <Link href={`/${o.type}/${o.slug}`}>
                  Research provider and terms <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="v2-panel v2-state">
          <Tag size={30} />
          <h3>No matching offers</h3>
          <p>Try another provider type or search. Offers may vary by region.</p>
          <button
            className="v2-button"
            onClick={() => {
              setType("all");
              setSearch("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
