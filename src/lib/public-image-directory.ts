import path from "node:path";

export function publicImageDirectory(kind: string) {
  return path.join(process.env.PUBLIC_UPLOAD_DIR || path.resolve("public/uploads"), kind);
}
