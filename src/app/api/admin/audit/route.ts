import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function GET(r: NextRequest) {
  const u = await requestUser(r);
  if (u?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = r.nextUrl.searchParams;
  const page = Math.max(1, Math.floor(Number(q.get("page")) || 1));
  const search = (q.get("search") || "").slice(0, 100);
  const where = search
    ? {
        OR: [
          { entityId: { contains: search } },
          { action: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
      skip: (page - 1) * 30,
    }),
    prisma.auditEvent.count({ where }),
  ]);
  return NextResponse.json({ events, total, pages: Math.ceil(total / 30) });
}
