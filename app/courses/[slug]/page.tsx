import { db } from "@/lib/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PlayCircle, FileText, Volume2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currencies";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findUnique({ where: { slug } });
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  const course = await db.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              videos: { select: { id: true, duration_seconds: true } },
              lesson_files: { select: { id: true, file_type: true } },
            },
          },
        },
      },
      levels: true,
    },
  });

  if (!course) notFound();

  const cookieStore = await cookies();
  const displayCurrency = cookieStore.get("preferred_currency")?.value ?? "USD";

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Back link */}
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="p-8 rounded-2xl bg-linear-to-r from-slate-900 to-indigo-950/30 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {course.levels && <Badge variant="indigo" size="md">{course.levels.name}</Badge>}
                <Badge variant={course.is_free ? "emerald" : "amber"} size="md">
                  {course.is_free ? "Free Course" : formatPrice(Number(course.price ?? 0), course.currency ?? "USD", displayCurrency)}
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-white">{course.title}</h1>
              {course.description && (
                <p className="text-slate-400 max-w-2xl">{course.description}</p>
              )}
            </div>
            <div className="text-right text-sm text-slate-400 space-y-1 shrink-0">
              <div><strong className="text-white">{course.modules.length}</strong> modules</div>
              <div><strong className="text-white">{totalLessons}</strong> lessons</div>
            </div>
          </div>
        </div>

        {/* Modules & Lessons */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white">Course Curriculum</h2>
          {course.modules.map((mod, idx) => (
            <div key={mod.id.toString()} className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              {/* Module Header */}
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {idx + 1}
                  </span>
                  <h3 className="font-semibold text-white">{mod.title}</h3>
                </div>
                <Badge variant="default" size="sm">{mod.lessons.length} lessons</Badge>
              </div>

              {/* Lessons */}
              <ul className="divide-y divide-slate-800/60">
                {mod.lessons.map((lesson, li) => (
                  <li key={lesson.id.toString()}>
                    <Link
                      href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                      id={`lesson-${lesson.slug}`}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-800/40 transition group"
                    >
                      <span className="text-xs text-slate-600 w-5 text-right shrink-0">{li + 1}</span>
                      <PlayCircle className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition" />
                      <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition">{lesson.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {lesson.lesson_files.some((f) => f.file_type?.includes("pdf")) && (
                          <FileText className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        {lesson.lesson_files.some((f) => f.file_type?.includes("audio")) && (
                          <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                          <span className="text-xs text-slate-500">{lesson.duration_minutes}m</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
                {mod.lessons.length === 0 && (
                  <li className="px-6 py-4 text-sm text-slate-600 italic">
                    No lessons published yet.
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
