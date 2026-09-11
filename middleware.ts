import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, ADMIN_COOKIE_NAME } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/api/admin/auth" || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { error: "Authentication required. Please log in to access this resource." },
      { status: 401 }
    );
  }

  const payload = await verifyJWT(sessionCookie.value);

  if (!payload) {
    return NextResponse.json(
      { error: "Your session has expired or is invalid. Please log in again." },
      { status: 401 }
    );
  }

  if (payload.role !== "admin" && !payload.isSuperUser) {
    return NextResponse.json(
      { error: "Access denied. You do not have the required permissions to view this information." },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
