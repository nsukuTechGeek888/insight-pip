import {hashPassword,verifyPassword} from "@/lib/passwords";
import { strongPassword } from "@/lib/platform-security";
import { requestUser } from "@/lib/request-user";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/db";

async function getUserFromToken(request: NextRequest) {
  return requestUser(request);
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (typeof currentPassword !== "string" || !strongPassword(newPassword))
      return NextResponse.json(
        { error: "Use a password of 10–128 characters" },
        { status: 400 },
      );
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid)
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.userSecurity.upsert({
      where: { userId: user.id },
      create: { userId: user.id, sessionsRevokedAt: new Date() },
      update: { sessionsRevokedAt: new Date() },
    });
    const response = NextResponse.json({
      success: true,
      message: "Password updated. Sign in again.",
    });
    response.cookies.delete("auth_token");
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}
