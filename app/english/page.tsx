import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "English Courses A1 to C2",
  description:
    "Complete CEFR English curriculum from A1 Beginner to C2 Mastery — in English, Tigrinya, and Amharic.",
};

const LEVEL_DESCRIPTIONS: Record<string, { label: string; desc: string; color: "emerald" | "amber" | "indigo" }> = {
  A1: { label: "Beginner", desc: "Start from zero — greetings, numbers, basic sentences.", color: "emerald" },
  A2: { label: "Elementary", desc: "Everyday conversations, shopping, directions.", color: "emerald" },
  B1: { label: "Intermediate", desc: "Work, travel, opinions, connected speech.", color: "amber" },
  B2: { label: "Upper-Intermediate", desc: "Abstract topics, fluent conversations, complex grammar.", color: "amber" },
  C1: { label: "Advanced", desc: "Academic English, professional writing, nuance.", color: "indigo" },
  C2: { label: "Mastery", desc: "Near-native proficiency, literature, precision.", color: "indigo" },
};

async function getEnglishCourses() {
  return db.course.findMany({
    where: { published: true, level_id: { not: null } },
    include: {
      levels: true,
      modules: { include: { lessons: { select: { id: true } } } },
    },
    orderBy: { level_id: "asc" },
  });
}

export default async function EnglishPage() {
  const courses = await getEnglishCourses();
  const localeValue = (await cookies()).get("locale")?.value ?? defaultLocale;
  const dictionary = getDictionary(isLocale(localeValue) ? localeValue : defaultLocale);
  const copy = dictionary.common;

  return (
    <main className="flex-1 py-20 px-4">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="emerald" dot>{copy.englishTrack}</Badge>
          <h1 className="text-4xl font-black text-white">{copy.englishTrack}</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A complete, structured curriculum covering every CEFR level — from your very first words to
            near-native English mastery. Available in English, Tigrinya, and Amharic.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <Badge variant="indigo" dot>🇬🇧 English</Badge>
            <Badge variant="emerald" dot>🇪🇷 ትግርኛ</Badge>
            <Badge variant="amber" dot>🇪🇹 አማርኛ</Badge>
          </div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const level = course.levels?.name ?? "A1";
            const info = LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS["A1"];
            const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
            const href = `/english/${level.toLowerCase()}`;

            return (
              <Link
                key={course.id.toString()}
                href={href}
                id={`english-level-${level.toLowerCase()}`}
                className="group p-7 rounded-2xl bg-slate-900/65 border border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 block space-y-4"
                style={{
                  borderColor: info.color === "emerald" ? "rgba(52,211,153,0)" : info.color === "amber" ? "rgba(251,191,36,0)" : "rgba(99,102,241,0)",
                }}
              >
                {/* Level badge */}
                <div className="flex items-start justify-between">
                  <span className={`text-4xl font-black ${
                    info.color === "emerald" ? "text-emerald-400" :
                    info.color === "amber" ? "text-amber-400" :
                    "text-indigo-400"
                  }`}>{level}</span>
                  <Badge variant={info.color} size="sm">{info.label}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{course.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{info.desc}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{lessonCount} {copy.lessons}</span>
                  <span className={`flex items-center gap-1.5 font-medium group-hover:gap-2.5 transition-all
                    ${info.color === "emerald" ? "text-emerald-400" : info.color === "amber" ? "text-amber-400" : "text-indigo-400"}
                  `}>
                    {copy.start} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Progress Guide */}
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Which level should you start?</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            If you have never studied English, start with <strong className="text-emerald-400">A1</strong>.
            If you already know the basics, try <strong className="text-amber-400">B1</strong>.
            Take the test in each level introduction to confirm your starting point.
          </p>
        </div>
      </div>
    </main>
  );
}
