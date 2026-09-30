import { execSync } from "node:child_process";

// If DATABASE_URL is not provided (e.g., during build phase in CI or Vercel before runtime env is injected),
// provide a fallback so Prisma CLI can generate the client code without failing schema validation.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/building_the_mind?schema=public";
}

try {
  console.log("Generating Prisma Client...");
  execSync("npx prisma generate", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Prisma Client generated successfully.");
} catch (error) {
  console.error("Failed to generate Prisma Client:", error);
  process.exit(1);
}
