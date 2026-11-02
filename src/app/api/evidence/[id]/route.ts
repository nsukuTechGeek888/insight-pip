import {privateDirectory} from "@/lib/private-storage";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requestUser(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const file = await prisma.privateEvidence.findUnique({ where: { id } });
    if (!file || (file.userId !== user.id && user.role !== "ADMIN"))
      return NextResponse.json(
        { error: "Evidence unavailable" },
        { status: 404 },
      );
    if (!/^[a-f0-9-]{36}$/.test(file.storageKey))
      return NextResponse.json(
        { error: "Evidence unavailable" },
        { status: 404 },
      );
    const bytes = await readFile(
      path.join(privateDirectory("evidence"),file.storageKey),
    );
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        action: "EVIDENCE_VIEWED",
        entityType: "evidence",
        entityId: id,
      },
    });
    const inline =
      file.mimeType.startsWith("image/") &&
      request.nextUrl.searchParams.get("preview") === "1";
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(bytes.length),
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="evidence.${file.mimeType === "application/pdf" ? "pdf" : file.mimeType.split("/")[1]}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Evidence unavailable" },
      { status: 404 },
    );
  }
}
