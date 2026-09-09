import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, PlayCircle, FileText, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ level: string }>;
}

const LEVEL_META: Record<string, { label: string; color: "emerald" | "amber" | "indigo" }> = {
  a1: { label: "Beginner", color: "emerald" },
  a2: { label: "Elementary", color: "emerald" },
  b1: { label: "Intermediate", color: "amber" },
  b2: { label: "Upper-Intermediate", color: "amber" },
  c1: { label: "Advanced", color: "indigo" },
  c2: { label: "Mastery", color: "indigo" },
};

const LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1", "c2"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params;
  const meta = LEVEL_META[level.toLowerCase()];
  return {
    title: `English ${level.toUpperCase()} – ${meta?.label ?? ""}`,
    description: `Master English ${level.toUpperCase()} with Building the Mind with Joss — available in English, Tigrinya, and Amharic.`,
  };
}

export default async function EnglishLevelPage({ params }: Props) {
  const { level } = await params;
  const levelCode = level.toUpperCase();
  const levelLower = level.toLowerCase();
  const meta = LEVEL_META[levelLower];
  if (!meta) notFound();

  const levelRecord = await db.levels.findFirst({ where: { name: levelCode } });
  if (!levelRecord) notFound();

  const course = await db.course.findFirst({
    where: { level_id: levelRecord.id },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { position: "asc" },
            include: {
              videos: { select: { id: true, duration_seconds: true } },
              lesson_files: { select: { id: true, file_type: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  // Prev / Next level
  const currentIndex = LEVEL_ORDER.indexOf(levelLower);
  const prevLevel = currentIndex > 0 ? LEVEL_ORDER[currentIndex - 1] : null;
  const nextLevel = currentIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[currentIndex + 1] : null;

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Back */}
        <Link href="/english" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          All English Levels
        </Link>

        {/* Header */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-linear-to-r from-slate-900 to-slate-900/50 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <Badge variant={meta.color}>{levelCode} — {meta.label}</Badge>
              <h1 className="text-3xl font-black text-white">{course.title}</h1>
              {course.description && <p className="text-slate-400 max-w-xl">{course.description}</p>}
            </div>
            <div className="text-sm text-slate-400 space-y-1 text-right">
              <div><strong className="text-white">{course.modules.length}</strong> modules</div>
              <div><strong className="text-white">{totalLessons}</strong> lessons</div>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white">Curriculum</h2>
          {course.modules.map((mod, idx) => (
            <div key={mod.id.toString()} className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                  {idx + 1}
                </span>
                <h3 className="font-semibold text-white">{mod.title}</h3>
                <span className="ml-auto text-xs text-slate-500">{mod.lessons.length} lessons</span>
              </div>
              <ul className="divide-y divide-slate-800/50">
                {mod.lessons.map((lesson, li) => {
                  const videoSecs = lesson.videos[0]?.duration_seconds ?? 0;
                  const durationMin = Math.ceil(videoSecs / 60);

                  return (
                    <li key={lesson.id.toString()}>
                      <Link
                        href={`/english/${levelLower}/${lesson.slug}`}
                        id={`lesson-${lesson.slug}`}
                        className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-800/40 transition group"
                      >
                        <span className="text-xs text-slate-600 w-5 text-right">{li + 1}</span>
                        <PlayCircle className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 transition" />
                        <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition">{lesson.title}</span>
                        <div className="flex items-center gap-2 text-slate-600">
                          {lesson.lesson_files.some((f) => f.file_type?.includes("pdf")) && (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          {lesson.lesson_files.some((f) => f.file_type?.includes("audio")) && (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          {durationMin > 0 && (
                            <span className="text-xs">{durationMin}m</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
                {mod.lessons.length === 0 && (
                  <li className="px-6 py-4 text-sm text-slate-600 italic">Lessons coming soon.</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center justify-between pt-4">
          {prevLevel ? (
            <Link href={`/english/${prevLevel}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
              {prevLevel.toUpperCase()} Level
            </Link>
          ) : <span />}
          {nextLevel && (
            <Link href={`/english/${nextLevel}`} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-white transition font-medium">
              Next: {nextLevel.toUpperCase()} Level
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
