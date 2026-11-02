"use client";
import { useEffect, useState } from "react";
import { Search, ShieldCheck, Users, ArrowUpRight } from "lucide-react";
import { notify, confirmAction, requestText } from "@/components/ui/Feedback";
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  security?: { suspendedAt?: string; emailVerifiedAt?: string };
  _count: { reviews: number; incidents: number; favorites: number };
};
type Provider = { id: number; name: string; type: string };
type Representative = {
  id: string;
  userId: string;
  entityType: string;
  entityId: number;
  user: { name: string; email: string };
};
export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reps, setReps] = useState<Representative[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [active, setActive] = useState<User | null>(null);
  const [provider, setProvider] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(() => {
      fetch(
        `/api/admin/users?${new URLSearchParams({ search, role, page: String(page) })}`,
        { signal: c.signal },
      )
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw Error(d.error);
          setUsers(d.users);
          setTotal(d.pagination.total);
          setPages(d.pagination.pages);
          setError("");
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(e.message);
        });
    }, 200);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [search, role, page, retry]);
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/research").then((r) => r.json()),
      fetch("/api/admin/representatives").then((r) => r.json()),
    ])
      .then(([p, r]) => {
        setProviders(p.providers || []);
        setReps(r.representatives || []);
      })
      .catch(() => {});
  }, [retry]);
  async function update(user: User, action: string) {
    if (
      !(await confirmAction(
        `${action === "role" ? "Change the role of" : user.security?.suspendedAt ? "Reactivate" : "Suspend"} ${user.name || user.email}? Existing sessions will be revoked.`,
      ))
    )
      return;
    const reason =
      action === "suspend"
        ? await requestText("Record a reason for suspending this account")
        : "";
    if (action === "suspend" && !reason) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/users", {
        method: action === "role" ? "PUT" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "role"
            ? {
                userId: user.id,
                role: user.role === "ADMIN" ? "USER" : "ADMIN",
              }
            : {
                userId: user.id,
                action: user.security?.suspendedAt ? "activate" : "suspend",
                reason,
              },
        ),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setRetry(retry + 1);
      setActive(null);
      notify(d.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update user");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">PEOPLE & PERMISSIONS</span>
        <h1>Access with accountability.</h1>
        <p>
          Manage trader accounts, administrator roles and authorised provider
          representatives. Every permission change is audited.
        </p>
      </header>
      <div className="v2-community-actions">
        <label className="v2-search">
          <Search size={17} />
          <input
            aria-label="Search users"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Filter users by role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All roles</option>
          <option value="USER">Traders</option>
          <option value="ADMIN">Administrators</option>
        </select>
        <span>{total} matching accounts</span>
      </div>
      {error && (
        <p className="v2-error" role="alert">
          {error}
        </p>
      )}
      <div className="v2-panel v2-audit-table">
        <table>
          <thead>
            <tr>
              <th>Trader</th>
              <th>Access</th>
              <th>Email</th>
              <th>Contributions</th>
              <th>Joined</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name || "Trader"}</strong>
                  <br />
                  {u.email}
                </td>
                <td>
                  <span className="v2-status">
                    {u.security?.suspendedAt ? "SUSPENDED" : u.role}
                  </span>
                </td>
                <td>
                  {u.security?.emailVerifiedAt
                    ? "Verified email"
                    : "Email unverified"}
                </td>
                <td>
                  {u._count.reviews} reviews
                  <br />
                  {u._count.incidents} incidents
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="v2-button"
                    onClick={() => {
                      setActive(u);
                      setProvider("");
                    }}
                  >
                    Inspect <ArrowUpRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && !error && (
          <div className="v2-state">
            <Users />
            <h3>No matching accounts</h3>
          </div>
        )}
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
      {active && (
        <section className="v2-panel v2-profile-section">
          <div className="v2-section-title">
            <h2>{active.name || active.email}</h2>
            <button onClick={() => setActive(null)}>Close inspection</button>
          </div>
          <p>{active.email}</p>
          <code>{active.id}</code>
          <div className="v2-workspace-ctas">
            <button
              className="v2-button"
              disabled={busy}
              onClick={() => void update(active, "role")}
            >
              {active.role === "ADMIN"
                ? "Change to trader"
                : "Make administrator"}
            </button>
            <button
              className="v2-button"
              disabled={busy}
              onClick={() =>
                void update(
                  active,
                  active.security?.suspendedAt ? "activate" : "suspend",
                )
              }
            >
              {active.security?.suspendedAt
                ? "Reactivate account"
                : "Suspend account"}
            </button>
            <a className="v2-button" href={"/admin/audit?search=" + active.id}>
              Audit history
            </a>
          </div>
          <h3>
            <ShieldCheck size={17} />
            Provider response permissions
          </h3>
          <p>
            Only grant this after independently confirming the person’s
            authority to represent the provider. An email address alone is not
            sufficient.
          </p>
          {reps
            .filter((r) => r.userId === active.id)
            .map((r) => (
              <div className="v2-saved-row" key={r.id}>
                <span>
                  {providers.find(
                    (p) => p.id === r.entityId && p.type === r.entityType,
                  )?.name || r.entityType + " #" + r.entityId}
                </span>
                <button
                  disabled={busy}
                  onClick={async () => {
                    if (
                      !(await confirmAction(
                        "Revoke this provider response permission?",
                      ))
                    )
                      return;
                    const response = await fetch(
                      "/api/admin/representatives?id=" + r.id,
                      { method: "DELETE" },
                    );
                    if (response.ok) setRetry(retry + 1);
                    else notify("Could not revoke permission");
                  }}
                >
                  Revoke
                </button>
              </div>
            ))}
          <form
            className="v2-form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const selected = providers.find(
                (p) => p.type + "-" + p.id === provider,
              );
              if (!selected) return;
              if (
                !(await confirmAction(
                  "Authorise this user to submit labelled responses on behalf of " +
                    selected.name +
                    "?",
                ))
              )
                return;
              setBusy(true);
              try {
                const r = await fetch("/api/admin/representatives", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: active.id,
                    entityType: selected.type,
                    entityId: selected.id,
                  }),
                });
                const d = await r.json();
                if (!r.ok) throw Error(d.error);
                setRetry(retry + 1);
                notify("Provider response permission recorded");
              } catch (e) {
                notify(e instanceof Error ? e.message : "Unable to authorise");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Provider
              <select
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="">Choose provider</option>
                {providers.map((p) => (
                  <option key={p.type + "-" + p.id} value={p.type + "-" + p.id}>
                    {p.name} · {p.type}
                  </option>
                ))}
              </select>
            </label>
            <button className="v2-button" disabled={busy}>
              Grant provider response permission
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
