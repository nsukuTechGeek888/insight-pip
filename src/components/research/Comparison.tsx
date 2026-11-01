"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRegion } from "@/contexts/RegionContext";
import {
  Search,
  Plus,
  X,
  Share2,
  GitCompareArrows,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { notify } from "@/components/ui/Feedback";
type Provider = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  updatedAt?: string;
  accountTypes?: Array<Record<string, unknown>>;
  programs?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};
function display(value: unknown): string {
  if (value === null || value === undefined || value === "")
    return "Not provided";
  if (typeof value === "boolean")
    return value ? "Yes (recorded)" : "No (recorded)";
  if (Array.isArray(value))
    return value.length ? value.map(display).join(" · ") : "Not provided";
  if (typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${display(v)}`)
      .join(" · ");
  return String(value);
}

export default function Comparison({
  initialType = "brokers",
  initialIds = [],
}: {
  initialType?: string;
  initialIds?: number[];
}) {
  const { region } = useRegion();
  const [type, setType] = useState(
    initialType === "prop-firms" ? "prop-firms" : "brokers",
  );
  const [ids, setIds] = useState<number[]>(initialIds.slice(0, 3));
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Provider[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [status, setStatus] = useState("idle");
  const [lookupError, setLookupError] = useState(false);
  const [different, setDifferent] = useState(false);
  const [selection, setSelection] = useState<Record<number, string>>({});
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (
      !initialIds.length &&
      !new URLSearchParams(window.location.search).has("type")
    ) {
      try {
        const v = JSON.parse(
          localStorage.getItem("insightpip-compare-v2") || "null",
        );
        if (
          v &&
          ["brokers", "prop-firms"].includes(v.type) &&
          Array.isArray(v.ids)
        ) {
          setType(v.type);
          setIds(
            v.ids
              .filter((n: unknown) => Number.isSafeInteger(n) && Number(n) > 0)
              .slice(0, 3),
          );
        }
      } catch {}
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        "insightpip-compare-v2",
        JSON.stringify({ type, ids }),
      );
    } catch {}
    const q = new URLSearchParams({ type });
    if (ids.length) q.set("ids", ids.join(","));
    window.history.replaceState(null, "", `/compare?${q}`);
  }, [ready, ids, type]);
  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(() => {
      fetch(
        `/api/research/providers?${new URLSearchParams({ type, region, search, limit: "20" })}`,
        { signal: c.signal },
      )
        .then(async (r) => {
          if (!r.ok) throw Error();
          const d = await r.json();
          setOptions(d.data);
          setLookupError(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setLookupError(true);
        });
    }, 250);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [search, type, region, retry]);
  useEffect(() => {
    if (!ids.length) {
      setProviders([]);
      setStatus("idle");
      return;
    }
    const c = new AbortController();
    setStatus("loading");
    fetch(
      `/api/research/compare?${new URLSearchParams({ type, ids: ids.join(","), region })}`,
      { signal: c.signal },
    )
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        setProviders(d.data);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => c.abort();
  }, [ids, type, region, retry]);
  const rows: string[][] = [
    ["founded", "Founded"],
    ["headquarters", "Headquarters"],
    ["platforms", "Trading platforms"],
    ...(type === "brokers"
      ? [
          ["minDeposit", "Minimum deposit (recorded amount)"],
          ["maxLeverage", "Maximum leverage"],
          ["averageSpreads", "Spreads"],
          ["commissions", "Commissions"],
          ["depositMethods", "Deposit methods"],
          ["withdrawalMethods", "Withdrawal methods"],
          ["withdrawalFee", "Withdrawal fee"],
          ["withdrawalProcessingTime", "Withdrawal processing"],
        ]
      : [
          ["maxAccountSize", "Maximum account size"],
          ["payoutFrequency", "Payout schedule"],
          ["payoutProcessingTime", "Payout processing"],
          ["payoutMethods", "Payout methods"],
          ["minimumPayout", "Minimum payout"],
        ]),
    ["restrictedRegions", "Restricted regions"],
  ];
  function selected(p: Provider) {
    const pool = type === "brokers" ? p.accountTypes : p.programs;
    return pool?.find((o) => String(o.id) === selection[p.id]);
  }
  const extraRows =
    type === "brokers"
      ? ["name", "minDeposit", "commission", "spreadType", "swapFree"]
      : ["name", "type", "timeLimit", "rules", "accountOptions"];
  return (
    <div className="v2-container">
      <header className="v2-page-heading">
        <span className="v2-eyebrow">SIDE-BY-SIDE RESEARCH</span>
        <h1>The details make the difference.</h1>
        <p>
          Compare up to three providers of the same type. Choose individual
          broker accounts or prop firm programs to inspect their specific
          conditions.
        </p>
      </header>
      <div className="v2-community-actions">
        <div className="v2-tabs">
          {[
            ["brokers", "Brokers"],
            ["prop-firms", "Prop firms"],
          ].map(([v, l]) => (
            <button
              key={v}
              aria-pressed={type === v}
              onClick={() => {
                setType(v);
                setIds([]);
                setSelection({});
                setSearch("");
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          className="v2-button"
          disabled={!ids.length}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              notify("Comparison link copied.");
            } catch {
              notify("Copy the comparison URL from your address bar.");
            }
          }}
        >
          <Share2 size={15} />
          Share comparison
        </button>
      </div>
      <div className="v2-compare-picker">
        <label className="v2-search">
          <Search size={19} />
          <input
            aria-label="Find providers to compare"
            placeholder="Search and add a provider…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span>{ids.length} / 3 selected</span>
      </div>
      {lookupError ? (
        <div className="v2-error" role="status">
          Provider lookup is unavailable.{" "}
          <button onClick={() => setRetry(retry + 1)}>Retry</button>
        </div>
      ) : (
        <div className="v2-picker-results">
          {options
            .filter((p) => !ids.includes(p.id))
            .slice(0, 6)
            .map((p) => (
              <button
                key={p.id}
                disabled={ids.length === 3}
                onClick={() => setIds((v) => [...v, p.id])}
              >
                <Plus size={15} />
                {p.name}
              </button>
            ))}
        </div>
      )}
      <div className="v2-selection-chips">
        {ids.map((id) => (
          <button
            key={id}
            onClick={() => setIds((v) => v.filter((n) => n !== id))}
          >
            {providers.find((p) => p.id === id)?.name || `Provider ${id}`}
            <X size={14} />
            <span className="sr-only">Remove</span>
          </button>
        ))}
      </div>
      {status === "error" ? (
        <div className="v2-panel v2-state">
          <RefreshCw size={30} />
          <h3>Comparison could not be loaded</h3>
          <p>Your selection has been preserved.</p>
          <button className="v2-button" onClick={() => setRetry(retry + 1)}>
            Try again
          </button>
        </div>
      ) : status === "loading" ? (
        <div className="v2-state" role="status">
          Loading provider details…
        </div>
      ) : !providers.length ? (
        <div className="v2-panel v2-state">
          <GitCompareArrows size={38} />
          <h2>Start with two providers.</h2>
          <p>
            Search above and add up to three. Your selections stay with you as
            you browse.
          </p>
          <Link href={`/${type}`} className="v2-button">
            Explore the directory
          </Link>
        </div>
      ) : (
        <>
          <div className="v2-compare-toolbar">
            <label>
              <input
                type="checkbox"
                checked={different}
                onChange={(e) => setDifferent(e.target.checked)}
              />
              Show differences only
            </label>
            <span>Missing information is marked “Not provided”.</span>
          </div>
          {providers.length < ids.length && (
            <p className="v2-error">
              Some selected providers are unavailable in this region or are no
              longer published.
            </p>
          )}
          <div
            className="v2-comparison-scroll"
            tabIndex={0}
            aria-label="Provider comparison table"
          >
            <table className="v2-comparison-table">
              <thead>
                <tr>
                  <th>Research criteria</th>
                  {providers.map((p) => (
                    <th key={p.id}>
                      <Link href={`/${type}/${p.slug}`}>
                        {p.name}
                        <ArrowUpRight size={15} />
                      </Link>
                      <select
                        aria-label={`Select ${p.name} account or program`}
                        value={selection[p.id] || ""}
                        onChange={(e) =>
                          setSelection((v) => ({
                            ...v,
                            [p.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Provider overview</option>
                        {(type === "brokers"
                          ? p.accountTypes
                          : p.programs
                        )?.map((o) => (
                          <option key={String(o.id)} value={String(o.id)}>
                            {String(o.name)}
                          </option>
                        ))}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter(
                    ([key]) =>
                      !different ||
                      new Set(providers.map((p) => display(p[key]))).size > 1,
                  )
                  .map(([key, label]) => {
                    const diff =
                      new Set(providers.map((p) => display(p[key]))).size > 1;
                    return (
                      <tr key={key} className={diff ? "v2-difference" : ""}>
                        <th>{label}</th>
                        {providers.map((p) => (
                          <td key={p.id}>{display(p[key])}</td>
                        ))}
                      </tr>
                    );
                  })}
                {providers.some((p) => selected(p)) && (
                  <tr>
                    <th
                      colSpan={providers.length + 1}
                      className="v2-comparison-section"
                    >
                      Selected{" "}
                      {type === "brokers" ? "account" : "funding program"}{" "}
                      conditions
                    </th>
                  </tr>
                )}
                {providers.some((p) => selected(p)) &&
                  extraRows
                    .filter(
                      (key) =>
                        !different ||
                        new Set(
                          providers.map((p) => display(selected(p)?.[key])),
                        ).size > 1,
                    )
                    .map((key) => (
                      <tr key={key}>
                        <th>{key.replace(/([A-Z])/g, " $1")}</th>
                        {providers.map((p) => (
                          <td key={p.id}>{display(selected(p)?.[key])}</td>
                        ))}
                      </tr>
                    ))}
                <tr>
                  <th>Official provider website</th>
                  {providers.map((p) => (
                    <td key={p.id}>
                      {p.website && /^https?:\/\//.test(p.website) ? (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                        >
                          Check current terms <ArrowUpRight size={13} />
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Record updated</th>
                  {providers.map((p) => (
                    <td key={p.id}>
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleDateString()
                        : "Not provided"}
                      <small>Verification date not confirmed</small>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="v2-form-note">
            Program rules can vary by account size. Review all account options
            and verify current terms with the provider. A provider website is
            not independent verification.
          </p>
        </>
      )}
    </div>
  );
}
