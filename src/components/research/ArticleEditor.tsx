"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  ImagePlus,
  ArrowLeft,
  Save,
} from "lucide-react";
import { notify, requestText } from "@/components/ui/Feedback";
export default function ArticleEditor({ id }: { id?: string }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Research");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (!id) return;
    fetch("/api/admin/blog?id=" + id)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        const p = d.post;
        setTitle(p.title);
        setSlug(p.slug);
        setSummary(p.summary);
        setCategory(p.category);
        setTags(p.tags.join(", "));
        setStatus(p.status);
        setFeatured(p.featured);
        setImage(p.imageUrl || "");
        if (editor.current) editor.current.textContent = "";
        if (editor.current) editor.current.innerHTML = p.content;
        if (p.publishedAt) {
          const local = new Date(p.publishedAt);
          setDate(
            `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`,
          );
          setTime(local.toTimeString().slice(0, 5));
        }
      })
      .catch((e) => setError(e.message));
  }, [id]);
  function command(name: string, value?: string) {
    editor.current?.focus();
    document.execCommand(name, false, value);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/blog", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: id,
          title,
          slug,
          summary,
          content: editor.current?.innerHTML || "",
          category,
          tags: tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status,
          featured,
          imageUrl: image,
          publishedAt: date ? new Date(date + "T" + time).toISOString() : null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      notify(
        status === "PUBLISHED" &&
          date &&
          new Date(date + "T" + time) > new Date()
          ? "Article scheduled. It will appear publicly at the selected time."
          : "Article saved",
      );
      router.push("/admin/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save article");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <Link className="v2-back" href="/admin/blog">
        <ArrowLeft size={15} />
        Content library
      </Link>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">EDITORIAL WORKSPACE</span>
        <h1>{id ? "Refine your research." : "Publish something useful."}</h1>
        <p>
          Clear writing, traceable claims and practical information for traders.
        </p>
      </header>
      {error && (
        <p role="alert" className="v2-error">
          {error}
        </p>
      )}
      <form onSubmit={save} className="v2-editor-layout">
        <section className="v2-panel v2-profile-section">
          <div className="v2-form-stack">
            <label>
              Article title
              <input
                required
                minLength={3}
                maxLength={200}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!id)
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                    );
                }}
              />
            </label>
            <label>
              Summary / search description
              <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </label>
            <label>
              Article URL slug
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={180}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
          </div>
          <label id="article-body-label">Article body</label>
          <div
            className="v2-editor-toolbar"
            role="toolbar"
            aria-label="Article formatting"
          >
            {[
              ["bold", "Bold", Bold],
              ["italic", "Italic", Italic],
              ["insertUnorderedList", "Bullet list", List],
            ].map(([c, l, Icon]) => {
              const Glyph = Icon as typeof Bold;
              return (
                <button
                  type="button"
                  key={String(c)}
                  aria-label={String(l)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => command(String(c))}
                >
                  <Glyph size={17} />
                </button>
              );
            })}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => command("formatBlock", "h2")}
            >
              Heading
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => command("formatBlock", "p")}
            >
              Paragraph
            </button>
            <button
              type="button"
              aria-label="Insert source link"
              onMouseDown={(e) => e.preventDefault()}
              onClick={async () => {
                const url = await requestText(
                  "Paste an HTTP or HTTPS source URL",
                );
                if (url && /^https?:\/\//.test(url)) command("createLink", url);
              }}
            >
              <LinkIcon size={17} />
            </button>
          </div>
          <div
            ref={editor}
            className="v2-rich-editor"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-labelledby="article-body-label"
            aria-multiline="true"
            onPaste={(e) => {
              e.preventDefault();
              document.execCommand(
                "insertText",
                false,
                e.clipboardData.getData("text/plain"),
              );
            }}
          />
          <p className="v2-form-note">
            Link to sources for factual and regulatory claims. Content is
            sanitised when saved.
          </p>
        </section>
        <aside className="v2-panel v2-profile-section">
          <h2>Publication settings</h2>
          <div className="v2-form-stack">
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <input
                required
                maxLength={100}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
            <label>
              Tags (comma separated)
              <input value={tags} onChange={(e) => setTags(e.target.value)} />
            </label>
            <label>
              Publication date
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
            <small>
              For published articles, a future date schedules public
              availability. Leave the date empty to publish now.
            </small>
            <label className="v2-checkbox">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Feature in research feed
            </label>
            <label className="v2-upload">
              <ImagePlus size={18} />
              Upload cover image
              <input
                aria-label="Upload article cover"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.set("file", file);
                  try {
                    const r = await fetch("/api/admin/blog/upload", {
                      method: "POST",
                      body: form,
                    });
                    const d = await r.json();
                    if (!r.ok) throw Error(d.error);
                    setImage(d.url);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Upload failed");
                  }
                }}
              />
            </label>
            {image && (
              <>
                <Image
                  width={600} height={320} unoptimized={!image.startsWith("/")}
                  className="v2-editor-cover"
                  src={image}
                  alt="Article cover"
                />
                <button
                  type="button"
                  className="v2-button"
                  onClick={() => setImage("")}
                >
                  Remove cover
                </button>
              </>
            )}
            <button className="v2-button v2-button-primary" disabled={busy}>
              <Save size={17} />
              {busy ? "Saving…" : "Save article"}
            </button>
            <Link className="v2-button" href="/admin/blog">
              Cancel
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
