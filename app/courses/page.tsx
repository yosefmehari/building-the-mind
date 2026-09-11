import { db } from "@/lib/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { Code2, BookOpen, ArrowRight, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currencies";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Courses",
  description:
    "Browse all courses on Building the Mind with Joss: Full Stack Web Development and English A1–C2.",
};

async function getCourses() {
  return db.course.findMany({
    where: { published: true },
    include: {
      course_categories: true,
      levels: true,
      modules: {
        include: { lessons: { select: { id: true } } },
      },
    },
    orderBy: { id: "asc" },
  });
}

export default async function CoursesPage() {
  const courses = await getCourses();
  const cookieStore = await cookies();
  const displayCurrency = cookieStore.get("preferred_currency")?.value ?? "USD";

  const fullStack = courses.filter((c) => !c.levels);
  const english = courses.filter((c) => c.levels);

  return (
    <main className="flex-1 py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge variant="indigo" dot>All Courses</Badge>
          <h1 className="text-4xl font-black text-white">Explore Our Courses</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to master Full Stack Web Development and English — from beginner to expert.
          </p>
        </div>

        {/* Full Stack Section */}
        {fullStack.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              Full Stack Web Development
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fullStack.map((course) => {
                const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
                return (
                  <Link
                    key={course.id.toString()}
                    href={`/courses/${course.slug}`}
                    id={`course-card-${course.slug}`}
                    className="group p-6 rounded-2xl bg-slate-900/65 border border-slate-800 hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 block space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Code2 className="w-6 h-6" />
                      </div>
                      <Badge variant={course.is_free ? "emerald" : "amber"} size="sm">
                        {course.is_free ? "Free" : formatPrice(Number(course.price ?? 0), course.currency ?? "USD", displayCurrency)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition">{course.title}</h3>
                      {course.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5" />
                        {lessonCount} lessons
                      </span>
                      <span className="flex items-center gap-2 text-indigo-400 font-medium group-hover:gap-3 transition-all">
                        Start <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* English Section */}
        {english.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              English Language A1 → C2
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {english.map((course) => {
                const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
                const level = course.levels?.name ?? "";
                const levelColor =
                  ["A1", "A2"].includes(level)
                    ? "emerald"
                    : ["B1", "B2"].includes(level)
                    ? "amber"
                    : "indigo";
                const href = level
                  ? `/english/${level.toLowerCase()}`
                  : `/courses/${course.slug}`;

                return (
                  <Link
                    key={course.id.toString()}
                    href={href}
                    id={`course-card-${course.slug}`}
                    className="group p-6 rounded-2xl bg-slate-900/65 border border-slate-800 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/8 transition-all duration-300 block space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={levelColor} size="md">{level || "English"}</Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition">{course.title}</h3>
                      {course.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5" />
                        {lessonCount} lessons
                      </span>
                      <span className="flex items-center gap-2 text-emerald-400 font-medium group-hover:gap-3 transition-all">
                        Start <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
