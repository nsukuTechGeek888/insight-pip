import { NextRequest, NextResponse } from "next/server";
import {verifyPassword} from "@/lib/passwords";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { sameOrigin } from "@/lib/request-user";
import { sessionSecret } from "@/lib/session-secret";
import { throttle } from "@/lib/platform-security";
import { getRegionFromRequest, setRegionCookie } from "@/lib/region";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Request origin is not allowed" },
        { status: 403 },
      );
    if(!await throttle(request,"login-ip",30,15))return NextResponse.json({error:"Too many sign-in attempts. Try later."},{status:429});
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (
      !email ||
      typeof body.password !== "string" ||
      body.password.length > 128
    )
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    if (!(await throttle(request, "login", 10, 15, email)))
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    const user = await prisma.user.findUnique({
      where: { email },
      include: { security: true },
    });
    if (!user || !(await verifyPassword(body.password, user.password)))
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    if (user.security?.suspendedAt)
      return NextResponse.json(
        { error: "This account is suspended. Contact support for assistance." },
        { status: 403 },
      );
    const region = user.region || getRegionFromRequest(request);
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        sessionEpoch: user.security?.sessionsRevokedAt?.toISOString() || null,
      },
      sessionSecret(),
      { expiresIn: "7d", algorithm: "HS256" },
    );
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        region,
        emailVerified: !!user.security?.emailVerifiedAt,
      },
    });
    for (const [name, value, httpOnly] of [
      ["auth_token", token, true],
      ["is_logged_in", "true", false],
    ] as const)
      response.cookies.set({
        name,
        value,
        httpOnly,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 604800,
        path: "/",
      });
    setRegionCookie(response, region);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable" },
      { status: 503 },
    );
  }
}
