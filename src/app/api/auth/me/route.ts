import { NextRequest, NextResponse } from "next/server";
import { requestUser } from "@/lib/request-user";
export async function GET(request: NextRequest) {
  const user = await requestUser(request);
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json(
    {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        region: user.region,
        createdAt: user.createdAt,
        emailVerified: !!user.security?.emailVerifiedAt,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
