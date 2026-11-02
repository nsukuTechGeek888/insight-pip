import {privateDirectory} from "@/lib/private-storage";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import path from "node:path";
import { prisma } from "@/lib/db";
import { requestUser } from "@/lib/request-user";
import { throttle } from "@/lib/platform-security";
import { evidenceMime } from "@/lib/evidence";
export async function GET(request: NextRequest) {
  const user = await requestUser(request);
  if (!user)
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const q = request.nextUrl.searchParams;
  const target = q.get("reviewId")
    ? { reviewId: q.get("reviewId")! }
    : q.get("incidentId")
      ? { incidentId: q.get("incidentId")! }
      : {};
  if (user.role === "ADMIN" && Object.keys(target).length === 0)
    return NextResponse.json({ files: [] });
  const files = await prisma.privateEvidence.findMany({
    where: { ...target, ...(user.role === "ADMIN" ? {} : { userId: user.id }) },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      size: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(
    { files },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: NextRequest) {
  let saved: string | undefined;
  try {
    const user = await requestUser(request);
    if (!user)
      return NextResponse.json(
        { error: "Sign in to attach private evidence" },
        { status: 401 },
      );
    if (!(await throttle(request, "evidence", 15, 60, user.id)))
      return NextResponse.json(
        { error: "Upload limit reached. Try later." },
        { status: 429 },
      );
    const length = Number(request.headers.get("content-length"));
    if (length > 6 * 1024 * 1024)
      return NextResponse.json(
        { error: "Maximum file size is 5 MB" },
        { status: 413 },
      );
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size < 8 || file.size > 5 * 1024 * 1024)
      return NextResponse.json(
        { error: "Choose a PNG, JPEG, WebP or PDF up to 5 MB" },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = evidenceMime(bytes);
    if (!mimeType || mimeType !== file.type)
      return NextResponse.json(
        { error: "File contents do not match a permitted file type" },
        { status: 400 },
      );
    const directory = privateDirectory("evidence");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const storageKey = randomUUID();
    saved = path.join(directory, storageKey);
    await writeFile(saved, bytes, { flag: "wx", mode: 0o600 });
    const evidence = await prisma.privateEvidence.create({
      data: {
        userId: user.id,
        originalName:
          file.name.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 180) || "Evidence",
        storageKey,
        mimeType,
        size: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        size: true,
        status: true,
      },
    });
    return NextResponse.json({ success: true, evidence }, { status: 201 });
  } catch {
    if (saved) await unlink(saved).catch(() => {});
    return NextResponse.json(
      { error: "Evidence could not be stored" },
      { status: 503 },
    );
  }
}
