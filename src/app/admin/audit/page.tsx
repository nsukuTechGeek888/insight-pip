"use client";
import { useEffect, useState } from "react";
type Event = {
  id: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: string;
};
export default function Audit() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(
      () =>
        fetch(
          `/api/admin/audit?page=${page}&search=${encodeURIComponent(search)}`,
          { signal: c.signal },
        )
          .then(async (r) => {
            const d = await r.json();
            if (!r.ok) throw Error(d.error);
            setEvents(d.events);
            setPages(d.pages);
            setError("");
          })
          .catch((e) => {
            if (e.name !== "AbortError") setError(e.message);
          }),
      200,
    );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [page, search]);
  return (
    <div>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">ACCOUNTABILITY</span>
        <h1>A record of platform decisions.</h1>
        <p>
          Moderation, account security, private evidence access and content
          changes are recorded here.
        </p>
      </header>
      <input
        className="v2-admin-search"
        aria-label="Search audit history"
        placeholder="Search action or record ID…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {error && (
        <p role="alert" className="v2-error">
          {error}
        </p>
      )}
      <div className="v2-panel v2-audit-table">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Record</th>
              <th>Actor</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td>{e.action.replaceAll("_", " ")}</td>
                <td>
                  {e.entityType}
                  <br />
                  <code>{e.entityId}</code>
                </td>
                <td>
                  <code>{e.actorId || "System"}</code>
                </td>
                <td>
                  {e.metadata ? (
                    <details>
                      <summary>Inspect</summary>
                      <pre>{JSON.stringify(e.metadata, null, 2)}</pre>
                    </details>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events.length && !error && (
          <div className="v2-state">No matching events.</div>
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
    </div>
  );
}
