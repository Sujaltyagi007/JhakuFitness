import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

/**
 * GET /api/admin/roles
 * List all system & custom roles with permission mappings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission(request, "roles:read");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [roles:read]" }, { status: 403 });
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
                module: true,
              },
            },
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.users,
      permissions: role.permissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return NextResponse.json({ roles: formattedRoles });
  } catch (error) {
    console.error("GET /api/admin/roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/roles
 * Create a new custom role with permissions
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission(request, "roles:write");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [roles:write]" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, permissionKeys } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if role exists
    const existing = await prisma.role.findUnique({ where: { name: trimmedName } });
    if (existing) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    // Resolve permission IDs from keys
    const validPermissions = Array.isArray(permissionKeys)
      ? await prisma.permission.findMany({
          where: { key: { in: permissionKeys } },
          select: { id: true },
        })
      : [];

    const newRole = await prisma.role.create({
      data: {
        name: trimmedName,
        description: description || null,
        isSystem: false,
        permissions: {
          create: validPermissions.map((p) => ({
            permissionId: p.id,
          })),
        },
      },
      include: {
        permissions: {
          select: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        role: {
          id: newRole.id,
          name: newRole.name,
          description: newRole.description,
          isSystem: newRole.isSystem,
          permissions: newRole.permissions.map((rp) => rp.permission),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
