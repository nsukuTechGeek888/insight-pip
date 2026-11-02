import { Prisma } from "@prisma/client";
export function evidenceMime(bytes: Buffer) {
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if (
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  )
    return "image/webp";
  if (bytes.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  return null;
}
export function evidenceIds(value: unknown): string[] {
  if (value === undefined) return [];
  if (
    !Array.isArray(value) ||
    value.length > 5 ||
    value.some((x) => typeof x !== "string" || x.length > 100)
  )
    throw Error("Select at most five valid evidence files");
  return [...new Set(value)];
}
export async function attachEvidence(
  tx: Prisma.TransactionClient,
  userId: string,
  ids: string[],
  target: { reviewId: string } | { incidentId: string },
) {
  if (!ids.length) return;
  const files = await tx.privateEvidence.findMany({
    where: { id: { in: ids }, userId, reviewId: null, incidentId: null },
  });
  if (files.length !== ids.length)
    throw Error("Evidence is unavailable or already attached");
  const result = await tx.privateEvidence.updateMany({
    where: { id: { in: ids }, userId, reviewId: null, incidentId: null },
    data: target,
  });
  if (result.count !== ids.length)
    throw Error("Evidence was attached elsewhere. Please retry.");
}
