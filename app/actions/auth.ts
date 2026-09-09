"use server";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type LoginState = { error?: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@") || password.length < 8) {
    return { error: "Enter a valid email and password." };
  }

  const user = await db.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.password_hash) : false;

  if (!user || !valid || user.role.toLowerCase() !== "admin") {
    return { error: "Invalid administrator credentials." };
  }

  await createSession(user.id.toString(), user.email, user.role);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
