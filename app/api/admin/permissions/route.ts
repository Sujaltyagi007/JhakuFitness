import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

/**
 * GET /api/admin/permissions
 * List all registered system permissions grouped by module
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission(request, "roles:read");
    if (!session) {
      return NextResponse.json({ error: "Forbidden: Missing permission [roles:read]" }, { status: 403 });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { key: "asc" }],
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("GET /api/admin/permissions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
