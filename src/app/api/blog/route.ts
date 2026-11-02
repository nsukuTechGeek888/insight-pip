import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// GET /api/blog - Get published blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const limit = Math.min(
      30,
      Math.max(1, Math.floor(Number(searchParams.get("limit")) || 12)),
    );
    const exclude = searchParams.get("exclude") || "";
    const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
    const skip = (page - 1) * limit;
    const status = "PUBLISHED";

    const where: import("@prisma/client").Prisma.BlogPostWhereInput = {
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    };
    const search = (searchParams.get("search") || "").slice(0, 150);
    if (search)
      where.AND = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
        ],
      };

    // Only show published posts for public, but allow status override
    if (status) {
      where.status = status;
    } else {
      where.status = "PUBLISHED";
    }

    if (category) {
      where.category = category;
    }

    if (exclude) {
      where.id = { not: exclude };
    }

    console.log("Fetching posts with where:", where);

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,

              avatar: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    console.log(`Found ${posts.length} posts`);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blog posts",
      },
      { status: 500 },
    );
  }
}
