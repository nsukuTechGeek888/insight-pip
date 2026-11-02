import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getAdminFromToken(request: NextRequest) {
  const user = await requestUser(request);
  return user?.role === "ADMIN" ? user : null;
}

// GET /api/admin/blog/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get distinct categories from blog posts
    const posts = await prisma.blogPost.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const categories = posts.map((p) => p.category).filter(Boolean);

    // If no categories exist, return default ones
    if (categories.length === 0) {
      return NextResponse.json({
        success: true,
        categories: ["Trading", "Platforms", "Reviews", "Education", "News"],
      });
    }

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
