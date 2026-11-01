"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Search,
  Menu,
  X,
  Globe2,
  Home,
  Building2,
  GitCompareArrows,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { useRegion } from "@/contexts/RegionContext";
import { useUser } from "@/contexts/UserContext";
const links = [
  ["Brokers", "/brokers"],
  ["Prop firms", "/prop-firms"],
  ["Reviews", "/reviews"],
  ["Compare", "/compare"],
  ["Offers", "/offers"],
  ["Learn", "/blog"],
];
export default function PlatformNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { region, setRegion } = useRegion();
  const { user } = useUser();
  return (
    <>
      <a className="v2-skip" href="#main-content">
        Skip to content
      </a>
      <header className="v2-header">
        <div className="v2-nav">
          <Link href="/" className="v2-brand" aria-label="InsightPip home">
            <span className="v2-mark">
              <ArrowUpRight size={24} />
            </span>
            Insight<span>Pip</span>
            <small>RESEARCH PLATFORM</small>
          </Link>
          <nav aria-label="Main navigation">
            {links.map(([label, url]) => (
              <Link
                key={url}
                href={url}
                aria-current={path.startsWith(url) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="v2-nav-tools">
            <label className="v2-region">
              <Globe2 size={16} />
              <select
                aria-label="Your region"
                value={region}
                onChange={(e) => void setRegion(e.target.value)}
              >
                {Object.entries({
                  GLOBAL: "Global",
                  SA: "South Africa",
                  UK: "United Kingdom",
                  EU: "Europe",
                  US: "United States",
                  UAE: "UAE",
                  AU: "Australia",
                  KE: "Kenya",
                  SG: "Singapore",
                  CA: "Canada",
                }).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <Link className="v2-icon-button" href="/search" aria-label="Search">
              <Search size={19} />
            </Link>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="v2-button v2-small"
            >
              {user ? "Workspace" : "Sign in"}
              <UserRound size={15} />
            </Link>
            <button
              className="v2-menu v2-icon-button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Open navigation"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="v2-mobile-menu" aria-label="Expanded navigation">
            {[
              ...links,
              ["Incidents", "/incidents"],
              ["Account", user ? "/dashboard" : "/login"],
              ...(user?.role === "ADMIN" ? [["Admin", "/admin"]] : []),
            ].map(([l, u]) => (
              <Link key={u} href={u} onClick={() => setOpen(false)}>
                {l}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </nav>
        )}
      </header>
      <nav className="v2-bottom" aria-label="Mobile navigation">
        {[
          ["Home", "/", Home],
          ["Discover", "/brokers", Building2],
          ["Reviews", "/reviews", ShieldCheck],
          ["Compare", "/compare", GitCompareArrows],
          ["Account", "/account", UserRound],
        ].map(([label, url, Icon]) => {
          const I = Icon as typeof Home;
          return (
            <Link
              key={String(url)}
              href={String(url)}
              aria-current={path === url ? "page" : undefined}
            >
              <I size={20} />
              <span>{String(label)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
