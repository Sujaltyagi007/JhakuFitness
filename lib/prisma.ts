import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> };
function createPrismaClient() {
  const accelerateUrl = process.env.ACCELERATE_URL;
  if (accelerateUrl) { return new PrismaClient({ accelerateUrl, log: ["error"] }); }
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter, log: ["error"] });
}
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
