import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { z } from "zod";
export async function GET(r: NextRequest) {
  const u = await requestUser(r);
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    success: true,
    user: {
      id: u.id,
      email: u.email,
      name: u.name,
      region: u.region,
      avatar: u.avatar,
      emailVerified: !!u.security?.emailVerifiedAt,
    },
  });
}
export async function PUT(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (!u)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = z
      .object({
        name: z.string().trim().min(1).max(100),
        region: z
          .enum([
            "GLOBAL",
            "SA",
            "UK",
            "EU",
            "US",
            "UAE",
            "AU",
            "KE",
            "SG",
            "CA",
          ])
          .optional(),
      })
      .safeParse(await r.json());
    if (!b.success)
      return NextResponse.json(
        { error: "Enter a valid name and region" },
        { status: 400 },
      );
    const user = await prisma.user.update({
      where: { id: u.id },
      data: b.data,
      select: { id: true, email: true, name: true, region: true, avatar: true },
    });
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json(
      { error: "Profile could not be saved" },
      { status: 503 },
    );
  }
}
