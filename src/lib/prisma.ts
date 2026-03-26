import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  // Clear the global reference on hot reload so NextJS picks up new definitions like SocialContent
  delete (globalThis as any).prisma;
  globalForPrisma.prisma = prisma;
}

export default prisma;
