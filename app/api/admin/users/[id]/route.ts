import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { hashPassword } from "@/lib/crypto";

/**
 * PATCH /api/admin/users/[id]
 * Update user details, role, status, or password
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(request, "users:write");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [users:write]" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, roleId, status, password } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Safeguard: Prevent modifying a Super User via this endpoint completely
    if (existingUser.isSuperUser) {
      return NextResponse.json(
        { error: "Super User accounts cannot be modified via the standard user management API." },
        { status: 403 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (name && typeof name === "string") dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone || null;
    if (email && typeof email === "string" && email.includes("@")) {
      dataToUpdate.email = email.toLowerCase().trim();
    }
    if (roleId !== undefined) dataToUpdate.roleId = roleId || null;
    if (status && ["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) dataToUpdate.status = status;
    if (password && typeof password === "string" && password.length >= 8) {
      dataToUpdate.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        isSuperUser: true,
        roleId: true,
        role: { select: { id: true, name: true } },
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (prevent deleting the last active Super User)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(request, "users:delete");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [users:delete]" }, { status: 403 });
    }

    const { id } = await params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Safeguard: Prevent deleting the Super User completely
    if (existingUser.isSuperUser) {
      return NextResponse.json(
        { error: "Forbidden: Cannot delete the Super User account." },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
