import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "./authOptions";

export interface PermissionDefinition {
  key: string;
  name: string;
  module: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // User Management
  { key: "users:read", name: "View Users", module: "User Management", description: "Can view all system users and their roles" },
  { key: "users:write", name: "Manage Users", module: "User Management", description: "Can create and edit user accounts and assign roles" },
  { key: "users:delete", name: "Delete Users", module: "User Management", description: "Can delete user accounts" },

  // Role Management
  { key: "roles:read", name: "View Roles", module: "Role Management", description: "Can view system roles and permissions" },
  { key: "roles:write", name: "Manage Roles", module: "Role Management", description: "Can create, edit, and assign custom roles and permissions" },

  // Products Catalog
  { key: "products:read", name: "View Products", module: "Products", description: "Can view product catalog and specifications" },
  { key: "products:write", name: "Manage Products", module: "Products", description: "Can create, update, and delete catalog products" },

  // Inventory & Stock
  { key: "inventory:read", name: "View Inventory", module: "Inventory", description: "Can view stock levels and stock movement history" },
  { key: "inventory:write", name: "Manage Inventory", module: "Inventory", description: "Can adjust stock quantities and log movements" },

  // CMS Content
  { key: "content:read", name: "View Site Content", module: "Content", description: "Can view website content blocks and site settings" },
  { key: "content:write", name: "Manage Content", module: "Content", description: "Can update site settings and CMS content blocks" },

  // Analytics & Financials
  { key: "analytics:read", name: "View Analytics", module: "Analytics", description: "Can view sales metrics, inventory valuation, and dashboard KPIs" },
  { key: "invoices:write", name: "Manage Invoices", module: "Invoices", description: "Can generate and print GST invoices and quotations" },
];

export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    name: "Super Admin",
    description: "Full system authority with unrestrictable permissions.",
    isSystem: true,
  },
  ADMIN: {
    name: "Administrator",
    description: "Standard administrative access to manage all operational aspects.",
    isSystem: true,
  },
  STAFF: {
    name: "Staff",
    description: "Operational staff access for products, inventory, and content.",
    isSystem: true,
  },
  VIEWER: {
    name: "Viewer",
    description: "Read-only access to view products, inventory, and content.",
    isSystem: true,
  },
} as const;

export interface RBACSessionUser {
  userId?: string;
  email?: string;
  name?: string;
  isSuperUser: boolean;
  roleId?: string | null;
  roleName?: string | null;
  permissions: string[];
}

/**
 * Checks if a user possesses a specific permission key.
 * Super Users always return true for any permission.
 */
export function hasPermission(
  user: { isSuperUser?: boolean; permissions?: string[] } | null | undefined,
  requiredPermission: string
): boolean {
  if (!user) return false;
  if (user.isSuperUser) return true;
  if (!user.permissions || !Array.isArray(user.permissions)) return false;

  // Exact match or wildcard match (e.g., "users:*" matches "users:read")
  return user.permissions.some(
    (perm) =>
      perm === requiredPermission ||
      perm === "*" ||
      (perm.endsWith(":*") && requiredPermission.startsWith(perm.slice(0, -1)))
  );
}

/**
 * Extracts and verifies the RBAC session from the request cookie/JWT or Bearer token.
 */
export async function getRBACSession(request: NextRequest): Promise<RBACSessionUser | null> {
  // 1. Check for Bearer token or cookies using NextAuth's getToken
  let tokenData = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_change_me_in_production"
  });

  // 2. If no token, check getServerSession (fallback for some NextAuth setups in App Router)
  if (!tokenData) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      tokenData = session.user as any;
    }
  }

  if (!tokenData) return null;

  const isSuperUser = Boolean(tokenData.isSuperUser);
  const permissions = Array.isArray(tokenData.permissions)
    ? (tokenData.permissions as string[])
    : (isSuperUser ? ["*"] : []);

  return {
    userId: (tokenData.userId || tokenData.id) as string | undefined,
    email: tokenData.email as string | undefined,
    name: tokenData.name as string | undefined,
    isSuperUser,
    roleId: tokenData.roleId as string | null | undefined,
    roleName: tokenData.roleName as string | null | undefined,
    permissions,
  };
}


export async function requirePermission(request: NextRequest, requiredPermission: string): Promise<RBACSessionUser | null> {
  const session = await getRBACSession(request);
  if (!session) return null;
  if (!hasPermission(session, requiredPermission)) return null;

  return session;
}
