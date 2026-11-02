import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { sessionSecret } from "@/lib/session-secret";
export async function requestUser(request: NextRequest) {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
    !sameOrigin(request)
  )
    return null;
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });
    if (typeof decoded === "string" || typeof decoded.userId !== "string")
      return null;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { security: true },
    });
    if (!user || user.security?.suspendedAt) return null;
    if (
      (user.security?.sessionsRevokedAt?.toISOString() || null) !==
      (decoded.sessionEpoch || null)
    )
      return null;
    return user;
  } catch {
    return null;
  }
}
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return (
    request.headers.get("sec-fetch-site") !== "cross-site" &&
    (!origin || origin === request.nextUrl.origin)
  );
}
