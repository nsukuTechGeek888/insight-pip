import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { z } from "zod";
import { articleHtml } from "@/lib/safe-content";
const schema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(180),
  summary: z.string().trim().min(10).max(1000),
  content: z.string().min(20).max(100000),
  category: z.string().trim().min(1).max(100),
  tags: z.array(z.string().max(50)).max(20).default([]),
  imageUrl: z
    .string()
    .max(500)
    .refine(
      (s) => !s || s.startsWith("/uploads/blog/") || /^https?:\/\//.test(s),
      "Use an uploaded image or an HTTP image URL",
    )
    .optional(),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime().nullable().optional(),
});
export async function GET(r: NextRequest) {
  const u = await requestUser(r);
  if (u?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = r.nextUrl.searchParams;
  if (q.get("id")) {
    const post = await prisma.blogPost.findUnique({
      where: { id: q.get("id")! },
    });
    return NextResponse.json(
      post
        ? { post: { ...post, content: articleHtml(post.content) } }
        : { error: "Article not found" },
      { status: post ? 200 : 404 },
    );
  }
  const page = Math.max(1, Math.floor(Number(q.get("page")) || 1));
  const limit = Math.min(
    50,
    Math.max(1, Math.floor(Number(q.get("limit")) || 20)),
  );
  const search = (q.get("search") || "").slice(0, 150);
  const status = q.get("status");
  const category = q.get("category");
  const where: Prisma.BlogPostWhereInput = {
    ...(status && status !== "all" ? { status } : {}),
    ...(category && category !== "all" ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.blogPost.count({ where }),
  ]);
  return NextResponse.json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
export async function POST(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await r.json();
    const parsed = schema.safeParse({
      ...body,
      slug:
        body.slug ||
        String(body.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
    });
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const d = parsed.data;
    const post = await prisma.$transaction(async (tx) => {
      const post = await tx.blogPost.create({
        data: {
          ...d,
          content: articleHtml(d.content),
          authorId: u.id,
          publishedAt:
            d.status === "PUBLISHED"
              ? d.publishedAt
                ? new Date(d.publishedAt)
                : new Date()
              : null,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: "ARTICLE_CREATED",
          entityType: "article",
          entityId: post.id,
        },
      });
      return post;
    });
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Article could not be saved. Check that the URL slug is unique.",
      },
      { status: 400 },
    );
  }
}
export async function PUT(r: NextRequest) {
  try {
    const u = await requestUser(r);
    if (u?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await r.json();
    if (typeof body.postId !== "string")
      return NextResponse.json({ error: "Article required" }, { status: 400 });
    let data: Prisma.BlogPostUpdateInput;
    if (body.action) {
      const actions: Record<string, Prisma.BlogPostUpdateInput> = {
        publish: { status: "PUBLISHED", publishedAt: new Date() },
        draft: { status: "DRAFT", publishedAt: null },
        archive: { status: "ARCHIVED" },
        feature: { featured: true },
        unfeature: { featured: false },
      };
      if (!actions[body.action])
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      data = actions[body.action];
    } else {
      const parsed = schema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 },
        );
      const d = parsed.data;
      data = {
        ...d,
        content: articleHtml(d.content),
        publishedAt:
          d.status === "PUBLISHED"
            ? d.publishedAt
              ? new Date(d.publishedAt)
              : new Date()
            : null,
      };
    }
    const post = await prisma.$transaction(async (tx) => {
      const p = await tx.blogPost.update({ where: { id: body.postId }, data });
      await tx.auditEvent.create({
        data: {
          actorId: u.id,
          action: "ARTICLE_UPDATED",
          entityType: "article",
          entityId: p.id,
          metadata: { action: body.action || "edit" },
        },
      });
      return p;
    });
    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json(
      { error: "Article could not be updated" },
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
    return NextResponse.json({ error: "Article required" }, { status: 400 });
  await prisma.$transaction(async (tx) => {
    await tx.blogPost.update({ where: { id }, data: { status: "ARCHIVED" } });
    await tx.auditEvent.create({
      data: {
        actorId: u.id,
        action: "ARTICLE_ARCHIVED",
        entityType: "article",
        entityId: id,
      },
    });
  });
  return NextResponse.json({ success: true });
}
