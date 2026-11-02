"use client";
import Image from "next/image";
import SaveProvider from "./SaveProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRegion } from "@/contexts/RegionContext";
import { ArrowUpRight, Search, Building2, RefreshCw } from "lucide-react";
type Provider = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  shortDescription?: string;
  headquarters?: string;
  founded?: number;
  rating?: number;
  minDeposit?: number;
  reviewsCount: number;
  updatedAt: string;
};
export default function ProviderDirectory({
  type,
  initialSearch = "",
}: {
  type: "brokers" | "prop-firms";
  initialSearch?: string;
}) {
  const { region } = useRegion();
  const [search, setSearch] = useState(initialSearch);
  const [query, setQuery] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState("");
  const [deposit, setDeposit] = useState("");
  const [program, setProgram] = useState("");
  const [order, setOrder] = useState("asc");
  const [items, setItems] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    setPage(1);
  }, [region, type]);
  useEffect(() => {
    const c = new AbortController();
    setStatus("loading");
    fetch(
      `/api/research/providers?${new URLSearchParams({ type, region, search: query, page: String(page), order, platform, ...(deposit ? { deposit } : {}), program })}`,
      { signal: c.signal },
    )
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        setItems(d.data);
        setTotal(d.pagination.total);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => c.abort();
  }, [type, region, query, page, order, retry, platform, deposit, program]);
  return (
    <div className="v2-container">
      <header className="v2-page-heading">
        <span className="v2-eyebrow">
          PROVIDER INTELLIGENCE /{" "}
          {type === "brokers" ? "BROKERS" : "PROP FIRMS"}
        </span>
        <h1>
          {type === "brokers"
            ? "Find a broker. Know your options."
            : "Your funding journey starts with research."}
        </h1>
        <p>
          {type === "brokers"
            ? "Explore broker profiles, account conditions and trader experiences. Research the details before choosing where to trade."
            : "Explore prop firms and their individual funding programs. Compare the rules, restrictions and trader experiences before taking a challenge."}
        </p>
      </header>
      <div className="v2-directory-tools">
        <label className="v2-search">
          <Search size={20} />
          <input
            aria-label="Search directory"
            placeholder={`Search ${type === "brokers" ? "brokers" : "prop firms"}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Sort providers"
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setPage(1);
          }}
        >
          <option value="asc">Name: A to Z</option>
          <option value="desc">Name: Z to A</option>
          <option value="updated">Recently updated</option>
        </select>
        <Link className="v2-button" href={`/compare?type=${type}`}>
          Compare providers <ArrowUpRight size={16} />
        </Link>
      </div>
      <details className="v2-panel v2-directory-filters">
        <summary>
          Refine your research
          {platform || deposit || program ? " · Filters active" : ""}
        </summary>
        <div>
          <label>
            Trading platform (exact recorded name)
            <input
              placeholder="e.g. MT5"
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setPage(1);
              }}
            />
          </label>
          {type === "brokers" ? (
            <label>
              Maximum minimum-deposit amount
              <input
                type="number"
                min="0"
                placeholder="Any amount"
                value={deposit}
                onChange={(e) => {
                  setDeposit(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          ) : (
            <label>
              Funding program name
              <input
                placeholder="Search program names"
                value={program}
                onChange={(e) => {
                  setProgram(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          )}
          <button
            className="v2-button"
            onClick={() => {
              setSearch("");
              setPlatform("");
              setDeposit("");
              setProgram("");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
        <p className="v2-form-note">
          Amounts use the recorded currency; check the profile. Missing values
          do not match numeric filters.
        </p>
      </details>
      <Link className="v2-ranking-link" href="/rankings">Explore published trader-rating rankings <ArrowUpRight size={14}/></Link>
      <div className="v2-directory-meta">
        <span>
          {status === "ready" ? `${total} providers` : "Provider directory"}
        </span>
        <span>Region: {region} · Check eligibility before registering</span>
      </div>
      {status === "loading" ? (
        <div className="v2-state" role="status">
          Loading research…
        </div>
      ) : status === "error" ? (
        <div className="v2-panel v2-state">
          <RefreshCw size={28} />
          <h3>Research is temporarily unavailable</h3>
          <p>
            The database connection could not be completed. Your filters are
            preserved.
          </p>
          <button className="v2-button" onClick={() => setRetry(retry + 1)}>
            Retry connection
          </button>
        </div>
      ) : items.length ? (
        <div className="v2-provider-grid">
          {items.map((p) => (
            <article className="v2-provider-card" key={p.id}>
              <div className="v2-card-top">
                <span className="v2-logo">
                  {p.logo ? <Image src={p.logo} alt="" width={48} height={48} unoptimized={!p.logo.startsWith("/")} /> : p.name[0]}
                </span>
                <span>{type === "brokers" ? "BROKER" : "PROP FIRM"}</span>
                <Link aria-label={`View ${p.name}`} href={`/${type}/${p.slug}`}>
                  <ArrowUpRight size={20} />
                </Link>
              </div>
              <h2>
                <Link href={`/${type}/${p.slug}`}>{p.name}</Link>
              </h2>
              <p>
                {p.shortDescription ||
                  "View the provider profile for available information and trading conditions."}
              </p>
              <dl>
                <div>
                  <dt>Trader rating</dt>
                  <dd>{p.rating ? p.rating.toFixed(1) + "/5" : "Not rated"}</dd>
                </div>
                <div>
                  <dt>Trust Score</dt>
                  <dd>Not assessed</dd>
                </div>
                <div>
                  <dt>Headquarters</dt>
                  <dd>{p.headquarters || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Founded</dt>
                  <dd>{p.founded || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Published reviews</dt>
                  <dd>{p.reviewsCount}</dd>
                </div>
              </dl>
              <div className="v2-card-footer">
                <Link href={`/${type}/${p.slug}`}>
                  Research provider <ArrowUpRight size={15} />
                </Link>
                <Link
                  href={`/compare?type=${type}&ids=${p.id}`}
                  aria-label={`Compare ${p.name}`}
                >
                  Compare
                </Link>
              </div>
              <SaveProvider id={p.id} type={type} />
              <small>
                Record updated {new Date(p.updatedAt).toLocaleDateString()} ·
                Verification not confirmed
              </small>
            </article>
          ))}
        </div>
      ) : (
        <div className="v2-panel v2-state">
          <Building2 size={32} />
          <h3>No matching providers</h3>
          <p>Try another search or select another region.</p>
          <button className="v2-button" onClick={() => setSearch("")}>
            Clear search
          </button>
        </div>
      )}
      <div className="v2-pagination">
        <button
          disabled={page <= 1 || status !== "ready"}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / 12))}
        </span>
        <button
          disabled={page * 12 >= total || status !== "ready"}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
