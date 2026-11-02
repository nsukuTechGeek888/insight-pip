"use client";
import { useState } from "react";
import Link from "next/link";
import { Paperclip, X, LockKeyhole } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
export default function EvidenceUploader({
  ids,
  onChange,
}: {
  ids: string[];
  onChange: (ids: string[]) => void;
}) {
  const { user } = useUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File) {
    setError("");
    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5 MB");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/evidence", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      onChange([...ids, d.evidence.id]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="v2-evidence">
      <h3>
        <LockKeyhole size={18} /> Private supporting evidence
      </h3>
      <p>
        Evidence is visible only to you and authorised moderators. Submission is
        separate from independent verification. Remove account numbers, identity
        documents and other people’s personal details.
      </p>
      {user ? (
        <>
          <label className="v2-upload">
            <Paperclip size={18} />
            {busy ? "Uploading…" : "Attach PNG, JPEG, WebP or PDF (up to 5 MB)"}
            <input
              aria-label="Attach private evidence"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              disabled={busy || ids.length >= 5}
              onChange={(e) => {
                if (e.target.files?.[0]) void upload(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </label>
          <ul>
            {ids.map((id, i) => (
              <li key={id}>
                <a
                  href={`/api/evidence/${id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Evidence {i + 1}
                </a>
                <button
                  type="button"
                  aria-label={`Remove evidence ${i + 1}`}
                  onClick={() => onChange(ids.filter((x) => x !== id))}
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
          <small>
            {ids.length}/5 files attached. Removing a file here detaches it from
            this submission.
          </small>
        </>
      ) : (
        <p>
          <Link href="/login?redirect=%2Freviews%2Fwrite">
            Sign in to attach evidence
          </Link>
          . Your written draft stays on this device.
        </p>
      )}
      {error && (
        <p role="alert" className="v2-error">
          {error}
        </p>
      )}
    </section>
  );
}
