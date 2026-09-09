import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client';
import { SYSTEM_PERMISSIONS, SYSTEM_ROLES } from '../lib/rbac';
import { hashPassword } from '../lib/crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding process...");

  // 1. Seed RBAC Permissions
  console.log("Seeding system permissions...");
  const permMap = new Map<string, string>();
  for (const perm of SYSTEM_PERMISSIONS) {
    const createdPerm = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        name: perm.name,
        module: perm.module,
        description: perm.description,
      },
      create: {
        key: perm.key,
        name: perm.name,
        module: perm.module,
        description: perm.description,
      },
    });
    permMap.set(perm.key, createdPerm.id);
  }
  console.log(`Seeded ${SYSTEM_PERMISSIONS.length} system permissions.`);

  // 2. Seed System Roles
  console.log("Seeding system roles...");
  const superAdminRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.SUPER_ADMIN.name },
    update: { description: SYSTEM_ROLES.SUPER_ADMIN.description, isSystem: true },
    create: { name: SYSTEM_ROLES.SUPER_ADMIN.name, description: SYSTEM_ROLES.SUPER_ADMIN.description, isSystem: true },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.ADMIN.name },
    update: { description: SYSTEM_ROLES.ADMIN.description, isSystem: true },
    create: { name: SYSTEM_ROLES.ADMIN.name, description: SYSTEM_ROLES.ADMIN.description, isSystem: true },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.STAFF.name },
    update: { description: SYSTEM_ROLES.STAFF.description, isSystem: true },
    create: { name: SYSTEM_ROLES.STAFF.name, description: SYSTEM_ROLES.STAFF.description, isSystem: true },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.VIEWER.name },
    update: { description: SYSTEM_ROLES.VIEWER.description, isSystem: true },
    create: { name: SYSTEM_ROLES.VIEWER.name, description: SYSTEM_ROLES.VIEWER.description, isSystem: true },
  });

  // Assign permissions to system roles
  const allPermIds = Array.from(permMap.values());
  for (const permId of allPermIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permId },
    });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permId },
    });
  }

  // Staff permissions
  const staffPermKeys = ["products:read", "products:write", "inventory:read", "inventory:write", "content:read", "content:write"];
  for (const key of staffPermKeys) {
    const pId = permMap.get(key);
    if (pId) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: staffRole.id, permissionId: pId } },
        update: {},
        create: { roleId: staffRole.id, permissionId: pId },
      });
    }
  }

  // Viewer permissions
  const viewerPermKeys = ["products:read", "inventory:read", "content:read", "analytics:read"];
  for (const key of viewerPermKeys) {
    const pId = permMap.get(key);
    if (pId) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: pId } },
        update: {},
        create: { roleId: viewerRole.id, permissionId: pId },
      });
    }
  }

  // 3. Seed Default Super User
  console.log("Checking for existing Super User...");
  const existingSuperUser = await prisma.user.findFirst({
    where: { isSuperUser: true },
  });

  if (!existingSuperUser) {
    console.log("No Super User found. Seeding default Super User...");
    const superUserEmail = (process.env.SUPER_USER_EMAIL || "superadmin@jhakufitness.com").toLowerCase().trim();
    const superUserPassword = process.env.SUPER_USER_PASSWORD || "Jhaku@SuperAdmin2026";
    const superPasswordHash = await hashPassword(superUserPassword);

    const superUser = await prisma.user.upsert({
      where: { email: superUserEmail },
      update: {
        name: "System Super User",
        isSuperUser: true,
        roleId: superAdminRole.id,
        status: "ACTIVE",
      },
      create: {
        email: superUserEmail,
        name: "System Super User",
        passwordHash: superPasswordHash,
        isSuperUser: true,
        roleId: superAdminRole.id,
        status: "ACTIVE",
      },
    });
    console.log(`Default Super User ready: ${superUser.email}`);
  } else {
    console.log(`Super User already exists (${existingSuperUser.email}). Skipping super user creation.`);
  }

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
