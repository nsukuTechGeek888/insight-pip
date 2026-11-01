"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Activity,
  UserRound,
  GitCompareArrows,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
const pages = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["My reviews", "/dashboard/reviews", MessageSquare],
  ["My incidents", "/dashboard/incidents", Activity],
  ["Account settings", "/dashboard/profile", UserRound],
  ["Compare providers", "/compare", GitCompareArrows],
] as const;
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const { user, logout } = useUser();
  return (
    <div className="v2-workspace">
      <aside className="v2-sidebar">
        <div className="v2-eyebrow">
          <UserRound size={16} /> TRADER WORKSPACE
        </div>
        <nav aria-label="Your workspace">
          {pages.map(([label, url, Icon]) => (
            <Link
              key={url}
              href={url}
              aria-current={path === url ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link href="/admin">
              Control centre <ArrowUpRight size={16} />
            </Link>
          )}
          {user && (
            <button className="v2-sidebar-logout" onClick={() => void logout()}>
              <LogOut size={17} />
              Sign out
            </button>
          )}
        </nav>
        <Link className="v2-sidebar-back" href="/brokers">
          Continue research <ArrowUpRight size={16} />
        </Link>
      </aside>
      <div className="v2-workspace-content">{children}</div>
    </div>
  );
}
