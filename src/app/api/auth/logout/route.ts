import { sameOrigin } from "@/lib/request-user";
// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Request origin is not allowed" },
        { status: 403 },
      );
    // Create success response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the auth_token cookie
    response.cookies.delete("auth_token");
    response.cookies.delete("is_logged_in");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
