import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { sessionSecret } from "@/lib/session-secret";
export async function requestUser(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, sessionSecret());
    if (typeof decoded === "string" || typeof decoded.userId !== "string")
      return null;
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true },
    });
  } catch {
    return null;
  }
}
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}
