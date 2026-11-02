import { NextRequest } from "next/server";
import { uploadPublicImage } from "@/lib/public-upload";
export async function POST(r: NextRequest) {
  return uploadPublicImage(r);
}
