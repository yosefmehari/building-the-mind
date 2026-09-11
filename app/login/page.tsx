import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { StudentLoginForm } from "@/components/auth/student-login-form";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Student Sign In", robots: { index: false, follow: false } };

export default async function StudentLoginPage() {
  const localeValue = (await cookies()).get("locale")?.value ?? defaultLocale;
  const copy = getDictionary(isLocale(localeValue) ? localeValue : defaultLocale).auth;
  return <main className="flex flex-1 items-center justify-center px-4 py-16"><section className="w-full max-w-md space-y-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl"><div className="space-y-3 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><GraduationCap className="h-6 w-6" /></div><h1 className="text-2xl font-black text-white">{copy.studentSignIn}</h1><p className="text-sm text-slate-400">{copy.signInDescription}</p></div><StudentLoginForm /><p className="text-center text-sm text-slate-500">{copy.newStudent} <Link href="/register" className="text-emerald-400 hover:text-emerald-300">{copy.createAccount}</Link></p></section></main>;
}
