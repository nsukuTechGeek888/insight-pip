"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
export default function AccountAccess({
  register = false,
}: {
  register?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const { checkAuth } = useUser();
  const router = useRouter();
  const query = useSearchParams();
  const destination = query.get("redirect");
  const redirect =
    destination?.startsWith("/") &&
    !destination.startsWith("//") &&
    !destination.includes("\\")
      ? destination
      : "/dashboard";
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch(`/api/auth/${register ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      if (register) setDone(d.message);
      else {
        await checkAuth();
        router.push(redirect);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to continue");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="v2-auth">
      <div className="v2-panel">
        <ShieldCheck size={30} />
        <span className="v2-eyebrow">YOUR INSIGHTPIP ACCOUNT</span>
        <h1>{register ? "Better research starts here." : "Welcome back."}</h1>
        <p>
          {register
            ? "Save your research, share your experience and follow your contributions."
            : "Continue your research and manage your trader contributions."}
        </p>
        {done ? (
          <div role="status">
            <p>{done}</p>
            <Link
              className="v2-button v2-button-primary"
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
            >
              Continue to sign in
            </Link>
          </div>
        ) : (
          <form className="v2-form-stack" onSubmit={submit}>
            {register && (
              <label>
                Your name
                <input
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={register ? 10 : 1}
                maxLength={128}
                autoComplete={register ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {register && (
              <small>
                Use at least 10 characters. Email verification is separate from
                trading experience verification.
              </small>
            )}
            {error && (
              <p className="v2-error" role="alert">
                {error}
              </p>
            )}
            <button className="v2-button v2-button-primary" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
              <ArrowUpRight size={17} />
            </button>
            {!register && (
              <Link href="/forgot-password">Forgot your password?</Link>
            )}
          </form>
        )}
        <p>
          {register ? "Already registered?" : "New to InsightPip?"}{" "}
          <Link
            href={`/${register ? "login" : "signup"}?redirect=${encodeURIComponent(redirect)}`}
          >
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <small>Your drafts remain in this browser through sign-in.</small>
      </div>
    </div>
  );
}
