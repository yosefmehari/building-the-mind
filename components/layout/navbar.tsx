"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Code2, Globe2, Menu, X, Search, ChevronDown, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/layout/notification-center";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";

type Locale = "en" | "ti" | "am";
type NavKey = "courses" | "fullStack" | "english";

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ti", label: "ትግርኛ", flag: "🇪🇷" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
];

const NAV_LINKS: { key: NavKey; href: string; icon: React.ReactNode; badge?: string }[] = [
  { key: "courses", href: "/courses", icon: <GraduationCap className="w-4 h-4" /> },
  { key: "fullStack", href: "/courses/full-stack-web-development", icon: <Code2 className="w-4 h-4" /> },
  { key: "english", href: "/english", icon: <BookOpen className="w-4 h-4" />, badge: "A1–C2" },
];

const COPY: Record<Locale, { courses: string; fullStack: string; english: string; studentSignIn: string; dashboard: string; search: string }> = {
  en: { courses: "Courses", fullStack: "Full Stack", english: "English", studentSignIn: "Student sign in", dashboard: "Dashboard", search: "Search" },
  ti: { courses: "ትምህርቲታት", fullStack: "Full Stack", english: "እንግሊዝኛ", studentSignIn: "ተማሃራይ እቶ", dashboard: "ዳሽቦርድ", search: "ድለ" },
  am: { courses: "ኮርሶች", fullStack: "Full Stack", english: "እንግሊዝኛ", studentSignIn: "የተማሪ መግቢያ", dashboard: "ዳሽቦርድ", search: "ፈልግ" },
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const copy = COPY[locale];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/session")
      .then((response) => response.json())
      .then((data: { role?: string | null }) => setRole(data.role ?? null))
      .catch(() => setRole(null));
  }, [pathname]);

  useEffect(() => {
    fetch("/api/locale")
      .then((response) => response.json())
      .then((data: { locale?: Locale }) => {
        if (data.locale && data.locale in COPY) setLocale(data.locale);
      })
      .catch(() => undefined);
  }, []);

  async function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    setIsLocaleOpen(false);
    await fetch("/api/locale", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: nextLocale }) });
    router.refresh();
  }

  const currentLocale = LOCALES.find((item) => item.code === locale)!;

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl" : "bg-transparent")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group" id="navbar-brand"><div className="relative h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"><GraduationCap className="w-4 h-4 text-white" /></div><div className="flex flex-col leading-none"><span className="text-sm font-bold text-white">Building the Mind</span><span className="text-[10px] text-indigo-400 font-medium tracking-wider">with Joss</span></div></Link>
        <div className="hidden md:flex items-center gap-1">{NAV_LINKS.map((link) => <Link key={link.href} href={link.href} id={`nav-link-${link.key}`} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200", pathname === link.href ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-300 hover:text-white hover:bg-slate-800/60")}>{link.icon}{copy[link.key]}{link.badge && <Badge variant="indigo" size="sm">{link.badge}</Badge>}</Link>)}</div>
        <div className="hidden md:flex items-center gap-2"><Link href="/search" aria-label={copy.search} id="navbar-search"><Button variant="ghost" size="icon" className="h-9 w-9"><Search className="w-4 h-4" /></Button></Link><NotificationCenter /><CurrencySwitcher onCurrencyChange={() => router.refresh()} /><div className="relative"><button id="navbar-language-selector" onClick={() => setIsLocaleOpen((value) => !value)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition border border-slate-800 hover:border-slate-700"><Globe2 className="w-3.5 h-3.5 text-indigo-400" /><span>{currentLocale.flag} {currentLocale.label}</span><ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isLocaleOpen && "rotate-180")} /></button>{isLocaleOpen && <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50">{LOCALES.map((item) => <button key={item.code} id={`lang-${item.code}`} onClick={() => void selectLocale(item.code)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors", locale === item.code ? "text-indigo-400 bg-indigo-500/10" : "text-slate-300 hover:text-white hover:bg-slate-800")}>{item.flag} {item.label}{locale === item.code && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}</button>)}</div>}</div>{role === "admin" ? <Link href="/admin" id="navbar-admin-dashboard"><Button variant="primary" size="sm">Admin Dashboard</Button></Link> : <Link href="/login"><Button variant="primary" size="sm">{copy.studentSignIn}</Button></Link>}{role !== "admin" && <Link href="/dashboard"><Button variant="ghost" size="sm">{copy.dashboard}</Button></Link>}</div>
        <button id="navbar-mobile-toggle" onClick={() => setIsMenuOpen((value) => !value)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" aria-label="Toggle menu">{isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div></div>
      {isMenuOpen && <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-4 py-4 space-y-1">{NAV_LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">{link.icon}{copy[link.key]}{link.badge && <Badge variant="indigo" size="sm">{link.badge}</Badge>}</Link>)}<div className="pt-3 border-t border-slate-800 flex gap-2">{role === "admin" ? <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2 py-2 text-center text-xs font-medium text-indigo-300">Admin Dashboard</Link> : <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2 py-2 text-center text-xs font-medium text-indigo-300">{copy.studentSignIn}</Link>}{role !== "admin" && <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex-1 rounded-lg border border-slate-800 px-2 py-2 text-center text-xs font-medium text-slate-300">{copy.dashboard}</Link>}</div><div className="flex gap-2">{LOCALES.map((item) => <button key={item.code} onClick={() => void selectLocale(item.code)} className={cn("flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition", locale === item.code ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300" : "border-slate-800 text-slate-400 hover:text-white")}>{item.flag} {item.label}</button>)}</div></div>}
    </nav>
  );
}
