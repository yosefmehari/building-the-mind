import React from "react";
import Link from "next/link";
import { GraduationCap, Globe2, Mail, Phone } from "lucide-react";

const COURSE_LINKS = [
  { label: "Full Stack Development", href: "/courses/full-stack-web-development" },
  { label: "English A1 - Beginner", href: "/english/a1" },
  { label: "English B1 – Intermediate", href: "/english/b1" },
  { label: "English C1 – Advanced", href: "/english/c1" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white">Building the Mind</span>
                <span className="text-[10px] text-indigo-400 font-medium tracking-wider">with Joss</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              A premier online platform delivering world-class education in Full Stack Web
              Development and the English language (A1–C2) in English, Tigrinya, and Amharic.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Globe2 className="w-3.5 h-3.5" />
              <span>🇬🇧 English · 🇪🇷 ትግርኛ · 🇪🇹 አማርኛ</span>
            </div>
          </div>

          {/* Courses Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Courses
            </h3>
            <ul className="space-y-2.5">
              {COURSE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Connect
            </h3>
            <div className="space-y-2.5">
              <a
                href="mailto:yosefmehari2404@gmail.com"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                id="footer-email"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                yosefmehari2404@gmail.com
              </a>
              <a
                href="tel:+251958373168"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                id="footer-phone"
              >
                <Phone className="w-4 h-4 text-indigo-400" />
                +251 958 373 168
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Building the Mind with Joss. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
