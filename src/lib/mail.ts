import {privateDirectory} from "@/lib/private-storage";
import nodemailer from "nodemailer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
export function applicationUrl() {
  const value =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  if (!value) throw Error("APP_URL must be configured");
  return new URL(value).origin;
}
export async function sendMail(to: string, subject: string, text: string) {
  if (process.env.SMTP_HOST) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      ...(process.env.SMTP_USER
        ? {
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          }
        : {}),
    });
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
    });
    return;
  }
  if (
    process.env.NODE_ENV === "production"
  )
    throw Error("SMTP delivery is not configured");
  const directory = privateDirectory("mail");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(directory, randomUUID() + ".json"),
    JSON.stringify({ to, subject, text, createdAt: new Date() }),
    { mode: 0o600 },
  );
}
