import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !email.includes("@") || !password || password.length < 8) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 characters) before running this script.");
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const db = new PrismaClient();

try {
  await db.user.upsert({
    where: { email },
    update: { password_hash: `scrypt:${salt}:${hash}`, role: "admin" },
    create: { name: "Administrator", email, password_hash: `scrypt:${salt}:${hash}`, role: "admin" },
  });
  console.log(`Administrator provisioned for ${email}`);
} finally {
  await db.$disconnect();
}
