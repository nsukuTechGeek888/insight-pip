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
  openIncidents:number;
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
  const [growth,setGrowth]=useState<{day:string;users:number;reviews:number;incidents:number}[]>([]);
  const [series,setSeries]=useState<"users"|"reviews"|"incidents">("users");
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
      setStats(d.stats);setGrowth(d.growth||[]);
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
            "Open incidents",
            stats?.openIncidents,
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
      <section className="v2-panel v2-growth-panel"><div className="v2-section-title"><div><span className="v2-eyebrow">ACTIVITY OVER TIME</span><h2>Platform growth · last 30 days</h2></div><div className="v2-tabs">{(['users','reviews','incidents'] as const).map(key=><button key={key} aria-pressed={series===key} onClick={()=>setSeries(key)}>{key==='users'?'New accounts':key==='reviews'?'Review submissions':'Incident reports'}</button>)}</div></div>{growth.length?<><svg viewBox="0 0 900 200" role="img" aria-label={`${series} per day over the last 30 days`}><line x1="10" y1="170" x2="890" y2="170" stroke="var(--ip-border)"/>{growth.map((point,index)=>{const max=Math.max(1,...growth.map(p=>p[series]));const height=point[series]/max*140;return <g key={point.day}><rect x={15+index*29} y={170-height} width="16" height={Math.max(height,1)} rx="3" fill="var(--ip-blue)" opacity={point[series]?1:.2}><title>{new Date(point.day).toLocaleDateString()}: {point[series]}</title></rect>{index%7===0&&<text x={15+index*29} y="192" fontSize="11" fill="var(--ip-text-2)">{new Date(point.day).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</text>}</g>;})}</svg><p className="v2-form-note">Counts come from all database records, grouped by UTC creation date. Review submissions include unpublished submissions.</p><details><summary>View daily counts</summary><div className="v2-audit-table"><table><thead><tr><th>Date</th><th>Accounts</th><th>Reviews</th><th>Incidents</th></tr></thead><tbody>{growth.map(p=><tr key={p.day}><td>{new Date(p.day).toLocaleDateString()}</td><td>{p.users}</td><td>{p.reviews}</td><td>{p.incidents}</td></tr>)}</tbody></table></div></details></>:<div className="v2-state">Growth data is unavailable.</div>}</section>
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
