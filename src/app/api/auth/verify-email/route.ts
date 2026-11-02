import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestUser, sameOrigin } from "@/lib/request-user";
import { digest, issueToken, throttle } from "@/lib/platform-security";
import { sendMail, applicationUrl } from "@/lib/mail";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Request origin is not allowed" },
        { status: 403 },
      );
    if (!(await throttle(request, "verify", 5, 15)))
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    const b = await request.json();
    if (b.token) {
      if (typeof b.token !== "string" || b.token.length !== 64)
        return NextResponse.json(
          { error: "Invalid verification link" },
          { status: 400 },
        );
      const ok = await prisma.$transaction(async (tx) => {
        const t = await tx.authToken.findUnique({
          where: { digest: digest(b.token) },
        });
        if (
          !t ||
          t.purpose !== "VERIFY" ||
          t.usedAt ||
          t.expiresAt <= new Date()
        )
          return false;
        const used = await tx.authToken.updateMany({
          where: { id: t.id, usedAt: null, expiresAt: { gt: new Date() } },
          data: { usedAt: new Date() },
        });
        if (!used.count) return false;
        await tx.userSecurity.upsert({
          where: { userId: t.userId },
          create: { userId: t.userId, emailVerifiedAt: new Date() },
          update: { emailVerifiedAt: new Date() },
        });
        return true;
      });
      return NextResponse.json(
        ok
          ? { success: true }
          : { error: "Verification link expired or already used" },
        { status: ok ? 200 : 400 },
      );
    }
    const user = await requestUser(request);
    if (!user)
      return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    if (user.security?.emailVerifiedAt)
      return NextResponse.json({
        success: true,
        message: "Email already verified",
      });
    const token = await issueToken(user.id, "VERIFY");
    await sendMail(
      user.email,
      "Verify your InsightPip email",
      `Verify your email: ${applicationUrl()}/verify-email?token=${token}\nEmail verification does not verify trading experience.`,
    );
    return NextResponse.json({
      success: true,
      message: "Verification email requested",
    });
  } catch {
    return NextResponse.json(
      { error: "Verification is temporarily unavailable" },
      { status: 503 },
    );
  }
}
