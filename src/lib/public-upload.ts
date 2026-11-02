import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requestUser } from "./request-user";
import { evidenceMime } from "./evidence";
export async function uploadPublicImage(
  request: NextRequest,
  forcedType?: string,
) {
  try {
    const user = await requestUser(request);
    if (user?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (Number(request.headers.get("content-length")) > 3 * 1024 * 1024)
      return NextResponse.json(
        { error: "Maximum image size is 2 MB" },
        { status: 413 },
      );
    const form = await request.formData();
    const file = form.get("file") || form.get("image");
    const type = forcedType || String(form.get("type") || "broker");
    if (!["broker", "prop-firm", "blog"].includes(type))
      return NextResponse.json(
        { error: "Invalid image destination" },
        { status: 400 },
      );
    if (!(file instanceof File) || file.size > 2 * 1024 * 1024 || file.size < 8)
      return NextResponse.json(
        { error: "Choose a PNG, JPEG or WebP image up to 2 MB" },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = evidenceMime(bytes);
    if (!mime || !mime.startsWith("image/") || mime !== file.type)
      return NextResponse.json(
        { error: "Image contents do not match a permitted format" },
        { status: 400 },
      );
    const filename =
      randomUUID() + "." + (mime === "image/jpeg" ? "jpg" : mime.split("/")[1]);
    const directory = path.join(process.cwd(), "public", "uploads", type);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    return NextResponse.json({
      success: true,
      url: `/uploads/${type}/${filename}`,
      imageUrl: `/uploads/${type}/${filename}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Image could not be saved" },
      { status: 503 },
    );
  }
}
