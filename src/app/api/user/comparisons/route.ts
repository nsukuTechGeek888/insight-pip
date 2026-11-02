import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { z } from "zod";
export async function GET(r: NextRequest) {
  const user = await requestUser(r);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const comparisons = await prisma.comparison.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ comparisons });
}
export async function POST(r: NextRequest) {
  try {
    const user = await requestUser(r);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(100),
        type: z.enum(["brokers", "prop-firms"]),
        ids: z.array(z.number().int().positive()).min(1).max(3),
        selection: z.record(z.string(), z.string()).optional(),
      optionSelection:z.record(z.string(),z.string()).optional(),
      })
      .safeParse(await r.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Choose 1–3 providers of the same type and a name" },
        { status: 400 },
      );
    const { name, type, ids, selection,optionSelection } = parsed.data;
    const available =
      type === "brokers"
        ? await prisma.broker.count({
            where: { id: { in: ids }, status: "ACTIVE" },
          })
        : await prisma.propFirm.count({
            where: { id: { in: ids }, status: "ACTIVE" },
          });
    if (available !== new Set(ids).size)
      return NextResponse.json(
        { error: "Provider unavailable" },
        { status: 404 },
      );
    if ((await prisma.comparison.count({ where: { userId: user.id } })) >= 100)
      return NextResponse.json(
        { error: "Saved comparison limit reached" },
        { status: 400 },
      );
    const comparison = await prisma.comparison.create({
      data: {
        userId: user.id,
        name,
        items: { type, ids: [...new Set(ids)] },
        criteria: { selection: selection || {},optionSelection:optionSelection||{} },
        isPublic: false,
      },
    });
    return NextResponse.json({ success: true, comparison }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save comparison" },
      { status: 503 },
    );
  }
}
export async function DELETE(r: NextRequest) {
  const user = await requestUser(r);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(r.nextUrl.searchParams.get("id"));
  if (!Number.isSafeInteger(id))
    return NextResponse.json({ error: "Invalid comparison" }, { status: 400 });
  await prisma.comparison.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}
