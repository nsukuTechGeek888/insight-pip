"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { notify } from "@/components/ui/Feedback";
import { ShieldCheck, UserRound } from "lucide-react";
export default function AccountSettings() {
  const { user, isLoading, checkAuth, logout } = useUser();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("GLOBAL");
  const [avatar,setAvatar]=useState("");
  const [verified, setVerified] = useState(false);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/profile")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setName(d.user.name || "");setAvatar(d.user.avatar||"");
        setRegion(d.user.region || "GLOBAL");
        setVerified(d.user.emailVerified);
      })
      .catch((e) => setError(e.message));
  }, [user]);
  async function save(url: string, body: unknown) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      if (url.includes("password")) {
        setCurrent("");
        setPassword("");
        setRepeat("");
        await logout();
        notify("Password changed. Please sign in again.");
      } else {
        await checkAuth();
        notify("Profile updated");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  if (!isLoading && !user)
    return (
      <div className="v2-state">
        <h1>Account settings</h1>
        <Link
          className="v2-button"
          href="/login?redirect=%2Fdashboard%2Fprofile"
        >
          Sign in
        </Link>
      </div>
    );
  return (
    <div>
      <header className="v2-page-heading">
        <span className="v2-eyebrow">YOU’RE IN CONTROL</span>
        <h1>Your account. Your preferences.</h1>
        <p>Manage your profile and protect access to your research.</p>
      </header>
      {error && (
        <p className="v2-error" role="alert">
          {error}
        </p>
      )}
      <div className="v2-settings-grid">
        <section className="v2-panel">
          <UserRound />
          <h2>Profile details</h2>
          {avatar&&<Image className="v2-avatar-preview" src={avatar} alt="Your public profile photo" width={80} height={80} unoptimized={!avatar.startsWith('/')}/>}
          <label className="v2-upload">Update public profile photo<input aria-label="Upload profile photo" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{const form=new FormData();form.set('file',file);const r=await fetch('/api/user/avatar',{method:'POST',body:form});const d=await r.json();if(!r.ok)throw Error(d.error);setAvatar(d.avatar);await checkAuth();notify('Profile photo updated');}catch(e){setError(e instanceof Error?e.message:'Upload failed');}finally{setBusy(false);}}}/></label><small>Profile photos are public. Use PNG, JPEG or WebP up to 2 MB.</small>
          <form
            className="v2-form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              void save("/api/user/profile", { name, region });
            }}
          >
            <label>
              Name
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Email
              <input value={user?.email || ""} readOnly />
            </label>
            <label>
              Preferred region
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {[
                  ["GLOBAL", "Global"],
                  ["SA", "South Africa"],
                  ["UK", "United Kingdom"],
                  ["EU", "Europe"],
                  ["US", "United States"],
                  ["UAE", "UAE"],
                  ["AU", "Australia"],
                  ["KE", "Kenya"],
                  ["SG", "Singapore"],
                  ["CA", "Canada"],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="v2-button v2-button-primary"
              disabled={busy || !user}
            >
              Save profile
            </button>
          </form>
          <h3>Email verification</h3>
          <p>
            {verified
              ? "Your email address is verified."
              : "Your email address has not been verified."}
          </p>
          <small>Email verification does not verify trading experience.</small>
          {!verified && (
            <button
              className="v2-button"
              disabled={busy || !user}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: "{}",
                  });
                  const d = await r.json();
                  if (!r.ok) throw Error(d.error);
                  notify(d.message);
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Unable to send email",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Send verification email
            </button>
          )}
        </section>
        <section className="v2-panel">
          <ShieldCheck />
          <h2>Password & access</h2>
          <p>Changing your password signs out existing sessions.</p>
          <form
            className="v2-form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (password !== repeat) {
                setError("Passwords must match");
                return;
              }
              void save("/api/user/password", {
                currentPassword: current,
                newPassword: password,
              });
            }}
          >
            <label>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                required
                minLength={10}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              />
            </label>
            <button className="v2-button" disabled={busy || !user}>
              Update password
            </button>
          </form>
          <h3>Appearance</h3>
          <p>
            InsightPip follows your device’s light or dark appearance
            automatically. Motion follows your device’s accessibility
            preference.
          </p>
        </section>
      </div>
    </div>
  );
}
