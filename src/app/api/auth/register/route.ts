import {hashPassword} from "@/lib/passwords";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { sameOrigin } from "@/lib/request-user";
import { strongPassword, throttle, issueToken } from "@/lib/platform-security";
import { sendMail, applicationUrl } from "@/lib/mail";
import { getRegionFromRequest } from "@/lib/region";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Request origin is not allowed" },
        { status: 403 },
      );
    if (!(await throttle(request, "register", 5, 60)))
      return NextResponse.json(
        { error: "Too many registrations. Please try later." },
        { status: 429 },
      );
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name =
      typeof (body.name || body.fullName) === "string"
        ? (body.name || body.fullName).trim()
        : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !name ||
      name.length > 100 ||
      !strongPassword(body.password)
    )
      return NextResponse.json(
        {
          error:
            "Enter a valid name and email, and a password of 10–128 characters.",
        },
        { status: 400 },
      );
    if (await prisma.user.findUnique({ where: { email } }))
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Try signing in or resetting your password.",
        },
        { status: 409 },
      );
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: await hashPassword(body.password),
        region: getRegionFromRequest(request),
        security: { create: {} },
      },
      select: { id: true, email: true, name: true },
    });
    let verificationSent = true;
    try {
      const token = await issueToken(user.id, "VERIFY");
      await sendMail(
        email,
        "Verify your InsightPip email",
        `Confirm your email address: ${applicationUrl()}/verify-email?token=${token}\nThis verifies your email only, not trading experience.`,
      );
    } catch {
      verificationSent = false;
    }
    return NextResponse.json(
      {
        success: true,
        user,
        message: verificationSent
          ? "Account created. Check your email to verify your address."
          : "Account created. Sign in and request another verification email from settings.",
        verificationSent,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Registration is temporarily unavailable" },
      { status: 503 },
    );
  }
}
