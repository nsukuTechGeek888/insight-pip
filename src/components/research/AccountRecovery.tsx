"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
export default function AccountRecovery({
  mode,
}: {
  mode: "request" | "reset" | "verify";
}) {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "reset" && password !== repeat) {
      setError("Passwords must match");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(
        mode === "verify" ? "/api/auth/verify-email" : "/api/auth/recovery",
        {
          method: mode === "reset" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "request"
              ? { email }
              : { token: params.get("token"), password },
          ),
        },
      );
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setDone(
        mode === "verify"
          ? "Your email is verified. This confirms your email address only."
          : mode === "reset"
            ? "Password updated. Sign in with your new password."
            : d.message,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to complete request");
    } finally {
      setBusy(false);
    }
  }
  const Icon =
    mode === "verify" ? ShieldCheck : mode === "request" ? Mail : KeyRound;
  return (
    <div className="v2-auth">
      <div className="v2-panel">
        <Icon size={30} />
        <span className="v2-eyebrow">ACCOUNT SECURITY</span>
        <h1>
          {mode === "request"
            ? "Forgot your password?"
            : mode === "reset"
              ? "Choose a new password."
              : "Verify your email."}
        </h1>
        <p>
          {mode === "request"
            ? "We’ll email a private reset link if your account is eligible."
            : mode === "reset"
              ? "Use at least 10 characters. This will sign out existing sessions."
              : "Confirm your address to keep your account information up to date."}
        </p>
        {done ? (
          <div role="status">
            <h2>Request complete</h2>
            <p>{done}</p>
            <Link className="v2-button v2-button-primary" href="/login">
              Continue to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="v2-form-stack">
            {mode === "request" ? (
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            ) : mode === "reset" ? (
              <>
                <label>
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                  />
                </label>
              </>
            ) : null}
            {error && (
              <p role="alert" className="v2-error">
                {error}
              </p>
            )}
            <button
              className="v2-button v2-button-primary"
              disabled={busy || (mode !== "request" && !params.get("token"))}
            >
              {busy
                ? "Please wait…"
                : mode === "verify"
                  ? "Verify email"
                  : mode === "request"
                    ? "Send reset link"
                    : "Update password"}
            </button>
            {mode !== "request" && !params.get("token") && (
              <p role="alert">
                This link is incomplete. Request another email.
              </p>
            )}
          </form>
        )}
        <Link href="/login">Back to sign in</Link>
      </div>
    </div>
  );
}
