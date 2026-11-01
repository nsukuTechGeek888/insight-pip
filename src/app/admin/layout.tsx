"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Trophy,
  MessageSquare,
  Activity,
  Users,
  BookOpen,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
const pages = [
  ["Overview", "/admin", LayoutDashboard],
  ["Brokers", "/admin/brokers", Building2],
  ["Prop firms", "/admin/prop-firms", Trophy],
  ["Review moderation", "/admin/reviews", MessageSquare],
  ["Incident centre", "/admin/incidents", Activity],
  ["Users & access", "/admin/users", Users],
  ["Content library", "/admin/blog", BookOpen],
] as const;
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  return (
    <div className="v2-workspace">
      <aside className="v2-sidebar">
        <div className="v2-eyebrow">
          <ShieldCheck size={16} /> CONTROL CENTRE
        </div>
        <nav aria-label="Administration">
          {pages.map(([label, url, Icon]) => (
            <Link
              key={url}
              href={url}
              aria-current={
                (url === "/admin" ? path === url : path.startsWith(url))
                  ? "page"
                  : undefined
              }
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <Link className="v2-sidebar-back" href="/">
          Public platform <ArrowUpRight size={16} />
        </Link>
      </aside>
      <div className="v2-workspace-content">{children}</div>
    </div>
  );
}
