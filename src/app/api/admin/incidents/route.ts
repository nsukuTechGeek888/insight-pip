import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

async function getAdminFromToken(request: NextRequest) {
  const user = await requestUser(request);
  return user?.role === "ADMIN" ? user : null;
}

// GET /api/admin/incidents - Get all incidents with filters
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";
    const entityType = searchParams.get("entityType") || "";
    const entityId = searchParams.get("entityId") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== "all") where.status = status;
    if (type !== "all") where.incidentType = type;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = parseInt(entityId);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          evidence: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          broker: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          propFirm: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.incident.count({ where }),
    ]);

    // Format incidents with display status
    const formattedIncidents = incidents.map((incident) => ({
      ...incident,
      displayStatus: incident.verifiedBadge
        ? "VERIFIED"
        : incident.proofUrls?.length > 0
          ? "PROOF_SUBMITTED"
          : incident.disputes > incident.confirmations
            ? "DISPUTED"
            : "UNVERIFIED",
    }));

    return NextResponse.json({
      success: true,
      incidents: formattedIncidents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch incidents",
      },
      { status: 500 },
    );
  }
}
