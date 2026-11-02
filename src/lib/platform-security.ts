import { createHash, randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "./db";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function safeReturn(value: unknown, fallback = "/dashboard") {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : fallback;
}
export function strongPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 10 && value.length <= 128;
}
export async function throttle(
  request: NextRequest,
  scope: string,
  limit: number,
  minutes = 15,
  subject = "",
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const width = minutes * 60000;
  const windowStart = new Date(Math.floor(Date.now() / width) * width);
  const key = digest(`${scope}:${subject||ip}:${windowStart.toISOString()}`);
  const row = await prisma.requestThrottle.upsert({
    where: { key },
    create: { key, windowStart },
    update: { count: { increment: 1 } },
  });
  return row.count <= limit;
}
export async function issueToken(userId: string, purpose: "RESET" | "VERIFY") {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + (purpose === "RESET" ? 30 : 1440) * 60000,
  );
  await prisma.$transaction(async (tx) => {
    await tx.authToken.updateMany({
      where: { userId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.authToken.create({
      data: { userId, purpose, digest: digest(token), expiresAt },
    });
  });
  return token;
}
