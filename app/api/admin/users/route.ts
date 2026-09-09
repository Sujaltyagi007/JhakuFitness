import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { hashPassword } from "@/lib/crypto";

/**
 * GET /api/admin/users
 * Returns list of system users with roles and status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission(request, "users:read");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [users:read]" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { isSuperUser: false },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        isSuperUser: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            isSystem: true,
          },
        },
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission(request, "users:write");
    if (!session) { return NextResponse.json({ error: "Forbidden: Missing permission [users:write]" }, { status: 403 }) }

    const body = await request.json();
    const { email, password, name, phone, roleId, status } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) { return NextResponse.json({ error: "Valid email address is required" }, { status: 400 }) }
    if (!password || typeof password !== "string" || password.length < 8) { return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 }) }
    if (!name || typeof name !== "string") { return NextResponse.json({ error: "Name is required" }, { status: 400 }) }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) { return NextResponse.json({ error: "A user with this email address already exists" }, { status: 409 }) }
    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name,
        phone: phone || null,
        roleId: roleId || null,
        status: status && ["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status) ? status : "ACTIVE",
        isSuperUser: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        isSuperUser: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
