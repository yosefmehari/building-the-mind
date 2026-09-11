import { db } from "@/lib/db";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Star,
  Globe2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

// Fetch course stats from the DB
async function getCourseStats() {
  const courses = await db.course.findMany({
    where: { published: true },
    include: { modules: { include: { lessons: true } } },
  });
  const totalLessons = courses.reduce(
    (sum, c) => sum + c.modules.reduce((s, m) => s + m.lessons.length, 0),
    0
  );
  return { courseCount: courses.length, lessonCount: totalLessons };
}

const ENGLISH_LEVELS = [
  { code: "A1", href: "/english/a1", desc: "Complete Beginner", color: "emerald" },
  { code: "A2", href: "/english/a2", desc: "Elementary", color: "emerald" },
  { code: "B1", href: "/english/b1", desc: "Intermediate", color: "amber" },
  { code: "B2", href: "/english/b2", desc: "Upper-Intermediate", color: "amber" },
  { code: "C1", href: "/english/c1", desc: "Advanced", color: "indigo" },
  { code: "C2", href: "/english/c2", desc: "Mastery", color: "indigo" },
] as const;

export default async function Home() {
  const { courseCount, lessonCount } = await getCourseStats();
  const localeValue = (await cookies()).get("locale")?.value ?? defaultLocale;
  const dictionary = getDictionary(isLocale(localeValue) ? localeValue : defaultLocale);
  const homeCopy = dictionary.home;

  return (
    <main className="flex-1">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[88vh] flex items-center justify-center text-center px-4 py-24 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-200 h-150 bg-indigo-600/12 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 -left-32 w-125 h-125 bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-32 w-125 h-125 bg-emerald-600/8 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl w-full space-y-8">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/8 text-indigo-300 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {homeCopy.professionalEducation}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]">
            <span className="bg-linear-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              {homeCopy.title}
            </span>
            <br />
            <span className="text-3xl sm:text-5xl font-bold text-slate-400">
              with Joss
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {homeCopy.masterDescription}
          </p>

          {/* Language badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Badge variant="indigo" dot>🇬🇧 English</Badge>
            <Badge variant="emerald" dot>🇪🇷 ትግርኛ (Tigrinya)</Badge>
            <Badge variant="amber" dot>🇪🇹 አማርኛ (Amharic)</Badge>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/courses">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} id="hero-browse-courses">
                {homeCopy.browseCourses}
              </Button>
            </Link>
            <Link href="/english/a1">
              <Button variant="glass" size="lg" leftIcon={<BookOpen className="w-4 h-4" />} id="hero-start-english">
                {homeCopy.startEnglish}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <strong className="text-white">{courseCount}</strong> {homeCopy.coursesCount}
            </span>
            <span className="w-px h-4 bg-slate-800 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <strong className="text-white">{lessonCount}+</strong> {homeCopy.lessonsCount}
            </span>
            <span className="w-px h-4 bg-slate-800 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <strong className="text-white">3</strong> {homeCopy.languagesCount}
            </span>
          </div>
        </div>
      </section>

      {/* ─── COURSE PILLARS ─── */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{homeCopy.whatYouWillLearn}</h2>
            <p className="text-slate-400">{homeCopy.twoTracks}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Stack Card */}
            <Link
              href="/courses/full-stack-web-development"
              id="card-full-stack"
              className="group p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition">
                <Code2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{homeCopy.fullStackTitle}</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Learn HTML, CSS, TypeScript, React, Next.js, Node.js, PostgreSQL, REST APIs, authentication, deployment, and much more.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["HTML/CSS", "TypeScript", "React", "Next.js", "PostgreSQL", "APIs"].map((tech) => (
                  <Badge key={tech} variant="indigo" size="sm">{tech}</Badge>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-indigo-400 text-sm font-medium group-hover:gap-3 transition-all">
                {homeCopy.startLearning} <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* English Card */}
            <Link
              href="/english"
              id="card-english"
              className="group p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{homeCopy.englishTitle}</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Full CEFR curriculum from absolute beginner to C2 mastery. Vocabulary, grammar, reading, writing, listening, and speaking.
              </p>
              {/* Level Grid */}
              <div className="grid grid-cols-3 gap-2">
                {ENGLISH_LEVELS.map((l) => (
                  <div
                    key={l.code}
                    className={`p-2 rounded-xl text-center border transition
                      ${l.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : ""}
                      ${l.color === "amber" ? "bg-amber-500/10 border-amber-500/25 text-amber-300" : ""}
                      ${l.color === "indigo" ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300" : ""}
                    `}
                  >
                    <div className="font-bold text-sm">{l.code}</div>
                    <div className="text-[10px] opacity-70">{l.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                {homeCopy.startWithA1} <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WHY BUILD THE MIND ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">{homeCopy.whyTitle}</h2>
            <p className="text-slate-400">{homeCopy.designedForResults}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe2 className="w-6 h-6" />,
                title: homeCopy.multilingual,
                desc: homeCopy.multilingualDescription,
                color: "indigo",
              },
              {
                icon: <PlayCircle className="w-6 h-6" />,
                title: homeCopy.videoLearning,
                desc: homeCopy.videoLearningDescription,
                color: "emerald",
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: homeCopy.structuredCurriculum,
                desc: homeCopy.structuredCurriculumDescription,
                color: "amber",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-3 hover:border-slate-700 transition"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center
                    ${item.color === "indigo" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : ""}
                    ${item.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : ""}
                    ${item.color === "amber" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : ""}
                  `}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 rounded-3xl bg-linear-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/20 text-center space-y-5 shadow-2xl">
            <h2 className="text-3xl font-bold text-white">
              {homeCopy.readyTitle}
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">
              {homeCopy.readyDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/courses">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} id="cta-browse-courses">
                  {homeCopy.exploreCourses}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
