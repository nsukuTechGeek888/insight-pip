import {hashPassword} from "@/lib/passwords";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { sameOrigin } from "@/lib/request-user";
import {
  digest,
  issueToken,
  strongPassword,
  throttle,
} from "@/lib/platform-security";
import { sendMail, applicationUrl } from "@/lib/mail";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Request origin is not allowed" },
        { status: 403 },
      );
    if (!(await throttle(request, "recovery", 5, 15)))
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 },
      );
    const b = await request.json();
    const email =
      typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
    if (!email || email.length > 254)
      return NextResponse.json(
        { error: "Enter your email address" },
        { status: 400 },
      );
    const user = await prisma.user.findUnique({
      where: { email },
      include: { security: true },
    });
    if (user && !user.security?.suspendedAt) {
      const token = await issueToken(user.id, "RESET");
      try { await sendMail(
        email,
        "Reset your InsightPip password",
        `Reset your password: ${applicationUrl()}/reset-password?token=${token}\nThis link expires in 30 minutes. Ignore this email if you did not request it.`,
      ); } catch { console.error("Password recovery email delivery failed"); }
    }
    return NextResponse.json({
      success: true,
      message:
        "If the account is eligible, a reset link will be sent to its email address.",
    });
  } catch {
    return NextResponse.json(
      { error: "Email delivery is temporarily unavailable. Please try later." },
      { status: 503 },
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Request origin is not allowed" },
        { status: 403 },
      );
    if (!(await throttle(request, "reset", 10, 15)))
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    const b = await request.json();
    if (
      typeof b.token !== "string" ||
      b.token.length !== 64 ||
      !strongPassword(b.password)
    )
      return NextResponse.json(
        {
          error: "Use a valid reset link and a password of 10–128 characters.",
        },
        { status: 400 },
      );
    const password = await hashPassword(b.password);
    const result = await prisma.$transaction(async (tx) => {
      const token = await tx.authToken.findUnique({
        where: { digest: digest(b.token) },
      });
      if (
        !token ||
        token.purpose !== "RESET" ||
        token.usedAt ||
        token.expiresAt <= new Date()
      )
        return false;
      const security = await tx.userSecurity.findUnique({
        where: { userId: token.userId },
      });
      if (security?.suspendedAt) return false;
      const consumed = await tx.authToken.updateMany({
        where: { id: token.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (!consumed.count) return false;
      await tx.user.update({ where: { id: token.userId }, data: { password } });
      await tx.userSecurity.upsert({
        where: { userId: token.userId },
        create: { userId: token.userId, sessionsRevokedAt: new Date() },
        update: { sessionsRevokedAt: new Date() },
      });
      await tx.auditEvent.create({
        data: {
          actorId: token.userId,
          action: "PASSWORD_RESET",
          entityType: "user",
          entityId: token.userId,
        },
      });
      return true;
    });
    return NextResponse.json(
      result
        ? { success: true }
        : { error: "This reset link has expired or has already been used." },
      { status: result ? 200 : 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to reset password" },
      { status: 503 },
    );
  }
}
