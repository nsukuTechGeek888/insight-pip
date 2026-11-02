import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { z } from "zod";
export async function GET(r: NextRequest) {
  const u = await requestUser(r);
  if (u?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    representatives: await prisma.providerRepresentative.findMany({
      include: { user: { select: { name: true, email: true } } },
      take: 200,
    }),
  });
}
export async function POST(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = z
      .object({
        userId: z.string(),
        entityType: z.enum(["brokers", "prop-firms"]),
        entityId: z.number().int().positive(),
      })
      .parse(await r.json());
    const provider =
      b.entityType === "brokers"
        ? await prisma.broker.findUnique({ where: { id: b.entityId } })
        : await prisma.propFirm.findUnique({ where: { id: b.entityId } });
    if (!provider)
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    await prisma.$transaction(async (tx) => {
      await tx.providerRepresentative.upsert({
        where: { userId_entityType_entityId: b },
        create: b,
        update: {},
      });
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: "REPRESENTATIVE_AUTHORISED",
          entityType: "user",
          entityId: b.userId,
          metadata: { providerType: b.entityType, providerId: b.entityId },
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Representative could not be authorised" },
      { status: 400 },
    );
  }
}
export async function DELETE(r: NextRequest) {
  const u = await requestUser(r);
  if (u?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = r.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Record required" }, { status: 400 });
  await prisma.$transaction(async (tx) => {
    await tx.providerRepresentative.delete({ where: { id } });
    await tx.auditEvent.create({
      data: {
        actorId: u.id,
        action: "REPRESENTATIVE_REVOKED",
        entityType: "representative",
        entityId: id,
      },
    });
  });
  return NextResponse.json({ success: true });
}
