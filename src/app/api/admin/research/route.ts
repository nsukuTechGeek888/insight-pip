import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { z } from "zod";
const source = z.object({
  kind: z.literal("source"),
  entityType: z.enum(["brokers", "prop-firms"]),
  entityId: z.number().int().positive(),
  category: z.string().trim().min(1).max(100),
  label: z.string().trim().min(2).max(200),
  url: z
    .string()
    .url()
    .refine((s) => /^https?:\/\//.test(s)),
  verifiedAt: z.string().datetime().nullable().optional(),
  note: z.string().max(2000).optional(),
});
const offer = z.object({
  kind: z.literal("offer"),
  entityType: z.enum(["brokers", "prop-firms"]),
  entityId: z.number().int().positive(),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(4000),
  discount: z.string().max(100).optional(),
  code: z.string().max(100).optional(),
  validUntil: z.string().datetime().nullable(),
  regions: z.array(z.string().max(10)).min(1).max(20),
  restrictedRegions: z.array(z.string().max(10)).max(20),
});
export async function GET(r: NextRequest) {
  const u = await requestUser(r);
  if (u?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [brokers, firms, sources] = await Promise.all([
    prisma.broker.findMany({
      select: { id: true, name: true, status: true, promotions: true },
      orderBy: { name: "asc" },
    }),
    prisma.propFirm.findMany({
      select: { id: true, name: true, status: true, promotions: true },
      orderBy: { name: "asc" },
    }),
    prisma.providerSource.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);
  return NextResponse.json({
    providers: [
      ...brokers.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        type: "brokers",
      })),
      ...firms.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        type: "prop-firms",
      })),
    ],
    offers: [
      ...brokers.flatMap((p) =>
        p.promotions.map((o) => ({
          ...o,
          entityType: "brokers",
          entityId: p.id,
          provider: p.name,
        })),
      ),
      ...firms.flatMap((p) =>
        p.promotions.map((o) => ({
          ...o,
          entityType: "prop-firms",
          entityId: p.id,
          provider: p.name,
        })),
      ),
    ],
    sources,
  });
}
export async function POST(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body=await r.json();const editingId=body.id;
    const b = z.discriminatedUnion("kind", [source, offer]).safeParse(body);
    if (!b.success)
      return NextResponse.json(
        { error: b.error.issues[0].message },
        { status: 400 },
      );
    const d = b.data;if(d.kind==='source'&&d.verifiedAt&&new Date(d.verifiedAt)>new Date())return NextResponse.json({error:'A source check cannot be dated in the future'},{status:400});
    const exists =
      d.entityType === "brokers"
        ? await prisma.broker.count({ where: { id: d.entityId } })
        : await prisma.propFirm.count({ where: { id: d.entityId } });
    if (!exists)
      return NextResponse.json(
        { error: "Provider unavailable" },
        { status: 404 },
      );
    const record = await prisma.$transaction(async (tx) => {
      let result;
      if (d.kind === "source") {
        const { kind, ...data } = d;
        void kind;
        result = editingId?await tx.providerSource.update({where:{id:String(editingId)},data:{...data,verifiedAt:data.verifiedAt?new Date(data.verifiedAt):null}}):await tx.providerSource.create({
          data: {
            ...data,
            verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
          },
        });
      } else {
        const { kind, entityType, entityId, ...data } = d;
        void kind;
        const values = {
          ...data,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
        };
        result =
          entityType === "brokers"
            ? editingId?await tx.brokerPromotion.update({where:{id:Number(editingId)},data:{...values,brokerId:entityId}}):await tx.brokerPromotion.create({
                data: { ...values, brokerId: entityId },
              })
            : editingId?await tx.propFirmPromotion.update({where:{id:Number(editingId)},data:{...values,propFirmId:entityId}}):await tx.propFirmPromotion.create({
                data: { ...values, propFirmId: entityId },
              });
      }
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: d.kind === "source" ? "SOURCE_RECORDED" : editingId?"OFFER_UPDATED":"OFFER_CREATED",
          entityType: d.kind,
          entityId: String(result.id),
          metadata: { providerType: d.entityType, providerId: d.entityId },
        },
      });
      return result;
    });
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Research record could not be saved" },
      { status: 400 },
    );
  }
}
export async function DELETE(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const q = r.nextUrl.searchParams;
    const kind = q.get("kind");
    const id = q.get("id");
    if (!id)
      return NextResponse.json({ error: "Record required" }, { status: 400 });
    await prisma.$transaction(async (tx) => {
      if (kind === "source") await tx.providerSource.delete({ where: { id } });
      else if (kind === "offer" && q.get("type") === "brokers")
        await tx.brokerPromotion.update({
          where: { id: Number(id) },
          data: { validUntil: new Date(0) },
        });
      else if (kind === "offer" && q.get("type") === "prop-firms")
        await tx.propFirmPromotion.update({
          where: { id: Number(id) },
          data: { validUntil: new Date(0) },
        });
      else throw Error();
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: kind === "source" ? "SOURCE_REMOVED" : "OFFER_EXPIRED",
          entityType: kind!,
          entityId: id,
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Record could not be updated" },
      { status: 400 },
    );
  }
}
