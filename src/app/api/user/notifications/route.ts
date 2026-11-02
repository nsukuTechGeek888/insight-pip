import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function GET(r: NextRequest) {
  const u = await requestUser(r);
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.notification.count({ where: { userId: u.id, readAt: null } }),
  ]);
  return NextResponse.json({ notifications, unread });
}
export async function PATCH(r: NextRequest) {
  const u = await requestUser(r);
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await r.json();
  await prisma.notification.updateMany({
    where: {
      userId: u.id,
      ...(typeof b.id === "string" ? { id: b.id } : {}),
      readAt: null,
    },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
