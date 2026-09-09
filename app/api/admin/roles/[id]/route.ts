import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

/**
 * PATCH /api/admin/roles/[id]
 * Update role description or permission assignments
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(request, "roles:write");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [roles:write]" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, permissionKeys } = body;

    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Protect system role names from being changed
    if (existingRole.isSystem && name && name !== existingRole.name) {
      return NextResponse.json({ error: "System role names cannot be renamed" }, { status: 400 });
    }

    // Protect Super Admin role permissions from being modified
    if (existingRole.name === "Super Admin" && Array.isArray(permissionKeys)) {
      return NextResponse.json({ error: "Super Admin role permissions are fixed and unrestrictable." }, { status: 400 });
    }

    // Resolve target permission IDs
    if (Array.isArray(permissionKeys)) {
      const validPermissions = await prisma.permission.findMany({ where: { key: { in: permissionKeys } }, select: { id: true } });

      // Clear existing and set new permissions transactionally
      await prisma.$transaction([
        prisma.rolePermission.deleteMany({ where: { roleId: id } }),
        prisma.rolePermission.createMany({
          data: validPermissions.map((p) => ({
            roleId: id,
            permissionId: p.id,
          })),
        }),
      ]);
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        description: description !== undefined ? description : existingRole.description,
        ...(name && !existingRole.isSystem ? { name } : {}),
      },
      include: {
        permissions: {
          select: { permission: true },
        },
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json({
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        isSystem: updatedRole.isSystem,
        userCount: updatedRole._count.users,
        permissions: updatedRole.permissions.map((rp) => rp.permission),
        updatedAt: updatedRole.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/roles/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/roles/[id]
 * Delete a custom role (system roles cannot be deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission(request, "roles:write");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [roles:write]" }, { status: 403 });
    }

    const { id } = await params;

    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (existingRole.isSystem) {
      return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 400 });
    }

    if (existingRole._count.users > 0) {
      return NextResponse.json(
        { error: `Cannot delete role. It is currently assigned to ${existingRole._count.users} user(s). Reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.role.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("DELETE /api/admin/roles/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
