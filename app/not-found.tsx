import Link from "next/link";
import { ShieldAlert, Home } from "lucide-react";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NotFound() {
  const localeValue = (await cookies()).get("locale")?.value ?? defaultLocale;
  const copy = getDictionary(isLocale(localeValue) ? localeValue : defaultLocale).common;
  return (
    <main className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white">404</h1>
          <h2 className="text-xl font-semibold text-slate-300">{copy.pageNotFound}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
        >
          <Home className="w-4 h-4" />
          {copy.backHome}
        </Link>
      </div>
    </main>
  );
}
