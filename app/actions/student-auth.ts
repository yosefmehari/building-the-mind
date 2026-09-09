"use server";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type StudentAuthState = { error?: string } | undefined;

export async function studentLogin(_state: StudentAuthState, formData: FormData): Promise<StudentAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email.includes("@") || password.length < 8) return { error: "Enter a valid email and password." };

  const user = await db.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !valid || user.role.toLowerCase() !== "student") return { error: "Invalid student credentials." };

  await createSession(user.id.toString(), user.email, user.role);
  redirect("/");
}

export async function registerStudent(_state: StudentAuthState, formData: FormData): Promise<StudentAuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2 || name.length > 100) return { error: "Name must be between 2 and 100 characters." };
  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({ data: { name, email, password_hash: passwordHash, role: "student" }, select: { id: true, email: true, role: true } });
  await createSession(user.id.toString(), user.email, user.role);
  redirect("/");
}

export async function studentLogout() {
  await destroySession();
  redirect("/");
}
