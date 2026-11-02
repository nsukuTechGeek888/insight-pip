"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowUpRight } from "lucide-react";
type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl?: string;
  publishedAt: string;
  author: { name: string };
};
export default function Learning() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(
        `/api/blog?${new URLSearchParams({ search, category, page: String(page), limit: "12" })}`,
        { signal: c.signal },
      )
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw Error(d.error);
          setPosts(d.posts);
          setPages(d.pagination.pages);
          setError("");
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(e.message);
        })
        .finally(() => setLoading(false));
    }, 200);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [search, category, page]);
  return (
    <div className="v2-container">
      <header className="v2-page-heading">
        <span className="v2-eyebrow">INSIGHTPIP RESEARCH & LEARNING</span>
        <h1>A clearer perspective on trading providers.</h1>
        <p>
          Understand the details behind the decision. Explore provider research,
          explainers and practical due diligence.
        </p>
      </header>
      <div className="v2-community-actions">
        <label className="v2-search">
          <Search size={18} />
          <input
            aria-label="Search articles"
            placeholder="Search research and guides…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Category{" "}
          <input
            className="v2-admin-search"
            aria-label="Filter articles by category"
            placeholder="All categories"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      {error ? (
        <div className="v2-panel v2-state" role="alert">
          <BookOpen />
          <h2>Research unavailable</h2>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="v2-state" role="status">
          Loading the research library…
        </div>
      ) : posts.length ? (
        <div className="v2-provider-grid">
          {posts.map((p) => (
            <article className="v2-panel v2-article-card" key={p.id}>
              {p.imageUrl && (
                <Link href={"/blog/" + p.slug}>
                  <Image src={p.imageUrl} alt="" width={600} height={320} sizes="(max-width:750px) 100vw, 33vw" unoptimized={!p.imageUrl.startsWith("/")}/>
                </Link>
              )}
              <div>
                <span className="v2-eyebrow">{p.category}</span>
                <h2>
                  <Link href={"/blog/" + p.slug}>{p.title}</Link>
                </h2>
                <p>{p.summary}</p>
                <div className="v2-card-footer">
                  <small>
                    {p.author?.name || "InsightPip editorial"} ·{" "}
                    {p.publishedAt
                      ? new Date(p.publishedAt).toLocaleDateString()
                      : "Publication date not provided"}
                  </small>
                  <Link href={"/blog/" + p.slug} aria-label={"Read " + p.title}>
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="v2-panel v2-state">
          <BookOpen size={30} />
          <h2>No matching articles</h2>
          <p>
            Try another search or category. Published research will appear here.
          </p>
          <button
            className="v2-button"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
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
