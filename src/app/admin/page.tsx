"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  RefreshCw,
  ArrowUpRight,
  Users,
  Building2,
  MessageSquare,
  Activity,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
type Stats = {
  users: number;
  brokers: number;
  propFirms: number;
  activeProviders: number;
  reportedReviews: number;
  publishedReviews: number;
  reviews: { total: number; pending: number };
  incidents: { total: number; pending: number };
  content: { published: number; drafts: number };
  newUsers7Days: number;
};
type Recent = { id: string; title: string; status: string; createdAt: string };
export default function AdminOverview() {
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch("/api/admin/stats");
      if (!r.ok) throw Error();
      const d = await r.json();
      setStats(d.stats);
      setRecent(d.recent.reviews);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (user?.role === "ADMIN") void load();
  }, [user]);
  if (isLoading)
    return <div className="v2-state">Checking administrator access…</div>;
  if (user?.role !== "ADMIN")
    return (
      <div className="v2-state">
        <ShieldCheck size={30} />
        <h2>Administrator access required</h2>
        <Link className="v2-button" href="/login?redirect=/admin">
          Sign in
        </Link>
      </div>
    );
  return (
    <div className="v2-admin-overview">
      <header className="v2-section-heading">
        <div>
          <span className="v2-eyebrow">PLATFORM OPERATIONS</span>
          <h1>Control centre</h1>
          <p>
            Monitor the platform. Keep research accurate and the community
            accountable.
          </p>
        </div>
        <button className="v2-button" onClick={load} disabled={busy}>
          <RefreshCw size={15} />
          {busy ? "Refreshing…" : "Refresh data"}
        </button>
      </header>
      {error && (
        <div className="v2-error" role="alert">
          Metrics could not be loaded. Retry the connection. Previous values, if
          present, may be out of date.
        </div>
      )}
      <div className="v2-stat-grid">
        {[
          [Users, "Total users", stats?.users, "/admin/users"],
          [
            Building2,
            "Active providers",
            stats?.activeProviders,
            "/admin/brokers",
          ],
          [
            MessageSquare,
            "Published reviews",
            stats?.publishedReviews,
            "/admin/reviews",
          ],
          [
            Activity,
            "Pending incidents",
            stats?.incidents.pending,
            "/admin/incidents",
          ],
        ].map(([Icon, label, value, url]) => {
          const I = Icon as typeof Users;
          return (
            <Link href={String(url)} key={String(label)} className="v2-stat">
              <I size={19} />
              <span>{String(label)}</span>
              <strong>
                {typeof value === "number" ? value.toLocaleString() : "—"}
              </strong>
              <small>
                Database total <ArrowUpRight size={13} />
              </small>
            </Link>
          );
        })}
      </div>
      <div className="v2-admin-columns">
        <section className="v2-panel">
          <div className="v2-panel-heading">
            <h2>Needs your attention</h2>
            <span>MODERATION</span>
          </div>
          {[
            [
              "Reviews awaiting moderation",
              stats?.reviews.pending,
              "/admin/reviews",
            ],
            ["Reported reviews", stats?.reportedReviews, "/admin/reviews"],
            [
              "Incidents awaiting review",
              stats?.incidents.pending,
              "/admin/incidents",
            ],
            ["Unpublished articles", stats?.content.drafts, "/admin/blog"],
          ].map(([label, count, url]) => (
            <Link
              className="v2-queue-row"
              href={String(url)}
              key={String(label)}
            >
              <span>{label}</span>
              <strong>{count ?? "—"}</strong>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </section>
        <section className="v2-panel">
          <div className="v2-panel-heading">
            <h2>Platform snapshot</h2>
            <span>CONTENT & GROWTH</span>
          </div>
          <div className="v2-snapshot">
            <p>
              <span>New users · last 7 days</span>
              <strong>{stats?.newUsers7Days ?? "—"}</strong>
            </p>
            <p>
              <span>Broker records</span>
              <strong>{stats?.brokers ?? "—"}</strong>
            </p>
            <p>
              <span>Prop firm records</span>
              <strong>{stats?.propFirms ?? "—"}</strong>
            </p>
            <p>
              <span>Published articles</span>
              <strong>{stats?.content.published ?? "—"}</strong>
            </p>
          </div>
        </section>
      </div>
      <section className="v2-panel">
        <div className="v2-panel-heading">
          <h2>Recent review submissions</h2>
          <Link href="/admin/reviews">
            Open moderation queue <ArrowUpRight size={15} />
          </Link>
        </div>
        {recent.length ? (
          recent.map((r) => (
            <Link key={r.id} className="v2-queue-row" href="/admin/reviews">
              <span>
                {r.title}
                <small>{new Date(r.createdAt).toLocaleString()}</small>
              </span>
              <span className="v2-status">{r.status}</span>
              <ArrowUpRight size={16} />
            </Link>
          ))
        ) : (
          <div className="v2-state">
            {stats
              ? "No recent submissions."
              : "Connect the database to load activity."}
          </div>
        )}
      </section>
      <div className="v2-admin-shortcuts">
        <Link href="/admin/brokers/import">
          <Building2 size={20} />
          Import broker data
          <ArrowUpRight size={16} />
        </Link>
        <Link href="/admin/prop-firms/import">
          <Activity size={20} />
          Import prop firm data
          <ArrowUpRight size={16} />
        </Link>
        <Link href="/admin/blog/new">
          <BookOpen size={20} />
          Write an article
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
