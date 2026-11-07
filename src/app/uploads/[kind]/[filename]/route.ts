import { readFile } from "node:fs/promises";
import path from "node:path";
import { publicImageDirectory } from "@/lib/public-image-directory";

const imageTypes = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" } as const;

export async function GET(_request: Request, context: { params: Promise<{ kind: string; filename: string }> }) {
  const { kind, filename } = await context.params;
  const match = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(png|jpg|webp)$/.exec(filename);
  if (!match || !["broker", "prop-firm", "blog", "avatars"].includes(kind)) {
    return new Response(null, { status: 404 });
  }
  try {
    const bytes = await readFile(path.join(publicImageDirectory(kind), filename));
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": imageTypes[match[2] as keyof typeof imageTypes],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
