import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="w-full max-w-md space-y-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Administrator sign in</h1>
          <p className="text-sm text-slate-400">Use the administrator account configured on the server.</p>
        </div>
        <LoginForm />
        <Link href="/" className="block text-center text-sm text-slate-500 transition hover:text-white">
          Return to public site
        </Link>
      </section>
    </main>
  );
}
