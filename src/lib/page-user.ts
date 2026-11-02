import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { requestUser } from "./request-user";
export async function pageUser() {
  const h = await headers();
  return requestUser(
    new NextRequest("http://localhost", {
      headers: { cookie: h.get("cookie") || "" },
    }),
  );
}
