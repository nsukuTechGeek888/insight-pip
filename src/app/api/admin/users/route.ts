import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getAdminUser(request: NextRequest) {
  const user = await requestUser(request);
  return user?.role === "ADMIN" ? user : null;
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const q = request.nextUrl.searchParams;
    const page = Math.max(1, Math.floor(Number(q.get("page")) || 1));
    const limit = Math.min(
      50,
      Math.max(1, Math.floor(Number(q.get("limit")) || 20)),
    );
    const search = (q.get("search") || "").slice(0, 150);
    const role = q.get("role");
    const where: import("@prisma/client").Prisma.UserWhereInput = {
      ...(role && ["USER", "ADMIN"].includes(role) ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [users, total, suspended] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          security: { select: { suspendedAt: true, emailVerifiedAt: true } },
          _count: {
            select: { reviews: true, incidents: true, favorites: true },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.userSecurity.count({ where: { suspendedAt: { not: null } } }),
    ]);
    return NextResponse.json({
      success: true,
      users,
      pagination: { page, total, pages: Math.ceil(total / limit) },
      suspended,
    });
  } catch {
    return NextResponse.json(
      { error: "User directory unavailable" },
      { status: 503 },
    );
  }
}

// PUT /api/admin/users - Update user role
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (userId === admin.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.userSecurity.upsert({
      where: { userId },
      create: { userId, sessionsRevokedAt: new Date() },
      update: { sessionsRevokedAt: new Date() },
    });
    await prisma.auditEvent.create({
      data: {
        actorId: admin.id,
        action: "ROLE_CHANGED",
        entityType: "user",
        entityId: userId,
        metadata: { role },
      },
    });
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/users - Suspend/activate user
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (userId === admin.id) {
      return NextResponse.json(
        { error: "Cannot suspend your own account" },
        { status: 400 },
      );
    }

    if (!["suspend", "activate", "reactivate"].includes(action))
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    const suspended = action === "suspend";
    await prisma.$transaction(async (tx) => {
      await tx.userSecurity.upsert({
        where: { userId },
        create: {
          userId,
          suspendedAt: suspended ? new Date() : null,
          suspensionReason: suspended
            ? String(body.reason || "Account suspended by administrator").slice(
                0,
                1000,
              )
            : null,
          sessionsRevokedAt: new Date(),
        },
        update: {
          suspendedAt: suspended ? new Date() : null,
          suspensionReason: suspended
            ? String(body.reason || "Account suspended by administrator").slice(
                0,
                1000,
              )
            : null,
          sessionsRevokedAt: new Date(),
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: admin.id,
          action: suspended ? "USER_SUSPENDED" : "USER_REACTIVATED",
          entityType: "user",
          entityId: userId,
        },
      });
    });
    return NextResponse.json({
      success: true,
      message: suspended
        ? "Account suspended and sessions revoked"
        : "Account reactivated. The trader can sign in again.",
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 },
    );
  }
}
