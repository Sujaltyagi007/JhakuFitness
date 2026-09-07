import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signJWT, verifyJWT } from "@/lib/jwt";

export const ADMIN_COOKIE_NAME = "jhaku_admin_session";
// Default password if environment variable is not configured
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jakhu2026";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // Generate signed JWT token
    const token = await signJWT({
      sub: "admin-user",
      role: "admin",
    }, SESSION_MAX_AGE);

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Session authenticated successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifyJWT(sessionCookie.value);

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      sub: payload.sub,
      role: payload.role,
      exp: payload.exp,
    },
  });
}

