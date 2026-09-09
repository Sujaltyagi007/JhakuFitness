import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signJWT, verifyJWT, ADMIN_COOKIE_NAME } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import crypto from "crypto";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jakhu2026";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!password || typeof password !== "string") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: "Password is required." },
        { status: 401 }
      );
    }

    // --- Path A: Email + Password User Login (RBAC) ---
    if (email && typeof email === "string" && email.trim().length > 0) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          role: {
            include: {
              permissions: {
                select: {
                  permission: {
                    select: { key: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      if (user.status !== "ACTIVE") {
        return NextResponse.json(
          { error: `Account is ${user.status.toLowerCase()}. Please contact a Super Admin.` },
          { status: 403 }
        );
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      // Collect user permissions
      const permissionKeys = user.isSuperUser
        ? ["*"]
        : user.role
        ? user.role.permissions.map((rp) => rp.permission.key)
        : [];

      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const tokenPayload = {
        sub: user.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        isSuperUser: user.isSuperUser,
        roleId: user.roleId,
        roleName: user.role?.name || (user.isSuperUser ? "Super User" : null),
        permissions: permissionKeys,
      };

      const token = await signJWT(tokenPayload, SESSION_MAX_AGE);

      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      });

      // Also set secondary cookie name if queried by getRBACSession
      cookieStore.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isSuperUser: user.isSuperUser,
          roleName: tokenPayload.roleName,
          permissions: permissionKeys,
        },
      });
    }

    // --- Path B: Fallback Legacy Admin Single-Password Login ---
    const expectedBuffer = Buffer.from(ADMIN_PASSWORD);
    const providedBuffer = Buffer.from(password);

    let isMatch = false;
    if (expectedBuffer.length === providedBuffer.length) {
      isMatch = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    } else {
      crypto.timingSafeEqual(expectedBuffer, expectedBuffer);
    }

    if (!isMatch) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const token = await signJWT(
      {
        sub: "admin-legacy-user",
        role: "admin",
        isSuperUser: true,
        permissions: ["*"],
      },
      SESSION_MAX_AGE
    );

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Session authenticated successfully",
      user: {
        isSuperUser: true,
        roleName: "Super Admin",
        permissions: ["*"],
      },
    });
  } catch (err) {
    console.error("POST /api/admin/auth error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME) || cookieStore.get("admin_session");

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifyJWT(sessionCookie.value);

  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const isSuperUser = Boolean(payload.isSuperUser ?? (payload.role === "admin" && !payload.userId));
  const permissions = Array.isArray(payload.permissions)
    ? (payload.permissions as string[])
    : isSuperUser
    ? ["*"]
    : [];

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: payload.userId || payload.sub,
      email: payload.email || "admin@jhakufitness.com",
      name: payload.name || (isSuperUser ? "Super User" : "Admin"),
      isSuperUser,
      roleName: payload.roleName || (isSuperUser ? "Super Admin" : "Admin"),
      permissions,
      exp: payload.exp,
    },
  });
}
