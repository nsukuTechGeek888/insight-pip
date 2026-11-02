import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import {verifyPassword} from "./passwords";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string;
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.trim().toLowerCase(),
          },
          include: { security: true },
        });

        if (!user || !user.password || user.security?.suspendedAt) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await verifyPassword(
          credentials.password,
          user.password,
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionEpoch: user.security?.sessionsRevokedAt?.toISOString() || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionEpoch = (
          user as unknown as { sessionEpoch: string | null }
        ).sessionEpoch;
      }
      if (token.id) {
        const current = await prisma.user.findUnique({
          where: { id: String(token.id) },
          include: { security: true },
        });
        if (
          !current ||
          current.security?.suspendedAt ||
          (current.security?.sessionsRevokedAt?.toISOString() || null) !==
            (token.sessionEpoch || null)
        )
          return null;
        token.role = current.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
