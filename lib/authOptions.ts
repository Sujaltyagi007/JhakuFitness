import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        });

        if (!user || user.status !== "ACTIVE") return null;

        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) return null;

        let permissions: string[] = [];
        if (user.isSuperUser) {
          permissions = ["*"];
        } else if (user.role) {
          permissions = user.role.permissions.map((rp: any) => rp.permission.key);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isSuperUser: user.isSuperUser,
          roleId: user.roleId,
          roleName: user.role?.name,
          permissions,
          preferences: user.preferences,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.isSuperUser = (user as any).isSuperUser;
        token.roleId = (user as any).roleId;
        token.roleName = (user as any).roleName;
        token.permissions = (user as any).permissions;
        token.preferences = (user as any).preferences;
      }
      
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.preferences !== undefined) token.preferences = session.preferences;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).isSuperUser = token.isSuperUser;
        (session.user as any).roleId = token.roleId;
        (session.user as any).roleName = token.roleName;
        (session.user as any).permissions = token.permissions;
        (session.user as any).preferences = token.preferences;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_change_me_in_production",
};
