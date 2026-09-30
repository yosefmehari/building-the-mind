import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton for Next.js
 * In development, Next.js hot-reloading can create multiple Prisma instances,
 * which exhausts the PostgreSQL connection pool.
 * Attaching it to globalThis ensures a single, shared connection instance.
 */

// Ensure a fallback DATABASE_URL exists during build-time module evaluation
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/building_the_mind?schema=public";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
