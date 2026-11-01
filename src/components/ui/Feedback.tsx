"use client";
import { useEffect, useRef, useState } from "react";
type Request = {
  kind: "notice" | "confirm" | "input";
  message: string;
  resolve: (value: string | boolean | null) => void;
};
export function notify(message: string) {
  window.dispatchEvent(
    new CustomEvent("insightpip-feedback", {
      detail: { kind: "notice", message, resolve: () => {} },
    }),
  );
}
export function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) =>
    window.dispatchEvent(
      new CustomEvent("insightpip-feedback", {
        detail: { kind: "confirm", message, resolve },
      }),
    ),
  );
}
export function requestText(message: string): Promise<string | null> {
  return new Promise((resolve) =>
    window.dispatchEvent(
      new CustomEvent("insightpip-feedback", {
        detail: { kind: "input", message, resolve },
      }),
    ),
  );
}
export default function Feedback() {
  const [queue, setQueue] = useState<Request[]>([]);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLDialogElement>(null);
  const current = queue[0];
  useEffect(() => {
    const listen = (e: Event) =>
      setQueue((q) => [...q, (e as CustomEvent<Request>).detail]);
    window.addEventListener("insightpip-feedback", listen);
    return () => window.removeEventListener("insightpip-feedback", listen);
  }, []);
  useEffect(() => {
    setValue("");
    if (current && !ref.current?.open) ref.current?.showModal();
    else if (!current) ref.current?.close();
  }, [current]);
  const close = (v: string | boolean | null) => {
    current?.resolve(v);
    setQueue((q) => q.slice(1));
  };
  return (
    <dialog
      ref={ref}
      className="v2-dialog"
      aria-labelledby="feedback-title"
      onCancel={(e) => {
        e.preventDefault();
        close(null);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          close(current?.kind === "input" ? value : true);
        }}
      >
        <span className="v2-eyebrow">INSIGHTPIP WORKSPACE</span>
        <h2 id="feedback-title">
          {current?.kind === "notice"
            ? "Update"
            : current?.kind === "input"
              ? "Add a note"
              : "Confirm action"}
        </h2>
        <p role={current?.kind === "notice" ? "status" : undefined}>
          {current?.message}
        </p>
        {current?.kind === "input" && (
          <textarea
            aria-label="Your note"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            maxLength={2000}
          />
        )}
        <div>
          {current?.kind !== "notice" && (
            <button type="button" onClick={() => close(null)}>
              Cancel
            </button>
          )}
          <button type="submit" className="v2-button">
            {current?.kind === "notice"
              ? "OK"
              : current?.kind === "input"
                ? "Save note"
                : "Continue"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
