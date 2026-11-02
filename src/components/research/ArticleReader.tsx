"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  publishedAt?: string;
  updatedAt: string;
  author: { name: string };
};
export default function ArticleReader({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/blog/" + encodeURIComponent(slug), { signal: c.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setPost(d.post);
        fetch(
          `/api/blog?category=${encodeURIComponent(d.post.category)}&exclude=${d.post.id}&limit=3`,
          { signal: c.signal },
        )
          .then((r) => r.json())
          .then((d) => setRelated(d.posts || []))
          .catch(() => {});
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [slug]);
  if (error)
    return (
      <div className="v2-container v2-state">
        <BookOpen />
        <h1>Article unavailable</h1>
        <p>{error}</p>
        <Link href="/blog">Research library</Link>
      </div>
    );
  if (!post)
    return (
      <div role="status" className="v2-state">
        Loading article…
      </div>
    );
  return (
    <div className="v2-container">
      <article className="v2-reading">
        <Link className="v2-back" href="/blog">
          <ArrowLeft size={15} />
          Research & learning
        </Link>
        <span className="v2-eyebrow">{post.category}</span>
        <h1>{post.title}</h1>
        <p className="v2-reading-summary">{post.summary}</p>
        <div className="v2-reading-byline">
          <strong>{post.author?.name || "InsightPip editorial"}</strong>
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString()
              : "Publication date not provided"}
          </span>
          <span>
            {Math.max(
              1,
              Math.ceil(
                post.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 220,
              ),
            )}{" "}
            min read
          </span>
        </div>
        {post.imageUrl && (
          <Image className="v2-reading-cover" src={post.imageUrl} alt="" width={1200} height={630} sizes="(max-width:800px) 100vw, 760px" unoptimized={!post.imageUrl.startsWith("/")}/>
        )}
        <div
          className="v2-reading-body"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <footer className="v2-reading-footer">
          <p>
            Last updated {new Date(post.updatedAt).toLocaleDateString()}.
            Educational content supports research and does not guarantee trading
            outcomes.
          </p>
          <Link href="/methodology">Our transparency principles</Link>
        </footer>
      </article>
      {related.length > 0 && (
        <section className="v2-related">
          <h2>Continue your research</h2>
          <div className="v2-provider-grid">
            {related.map((p) => (
              <article className="v2-provider-card" key={p.id}>
                <span className="v2-eyebrow">{p.category}</span>
                <h3>
                  <Link href={"/blog/" + p.slug}>{p.title}</Link>
                </h3>
                <p>{p.summary}</p>
                <Link href={"/blog/" + p.slug}>
                  Read article <ArrowUpRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
