import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileVideo, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { LessonForm } from "@/components/admin/lesson-form";

export const metadata: Metadata = {
  title: "Manage Lessons",
  robots: { index: false, follow: false },
};

export default async function AdminLessonsPage() {
  await requireAdmin();
  const [modules, lessons] = await Promise.all([
    db.module.findMany({ orderBy: [{ course_id: "asc" }, { position: "asc" }], include: { courses: { select: { title: true } } } }),
    db.lesson.findMany({
      orderBy: [{ module_id: "asc" }, { position: "asc" }],
      include: { modules: { select: { title: true, courses: { select: { title: true } } }, }, _count: { select: { videos: true, lesson_files: true } } },
    }),
  ]);

  return (
    <main className="flex-1 px-4 py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Content management</p><h1 className="mt-1 text-3xl font-black text-white">Lessons</h1><p className="mt-2 text-sm text-slate-400">Build the individual learning experiences inside each module.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"><BookOpen className="h-3.5 w-3.5 text-emerald-400" />{lessons.length} total</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4"><FileVideo className="h-5 w-5 text-emerald-400" /><div><h2 className="font-bold text-white">Lesson library</h2><p className="text-xs text-slate-500">Video and file attachments appear here as they are added</p></div></div>
            {lessons.length > 0 ? <div className="divide-y divide-slate-800/80">{lessons.map((lesson) => <div key={lesson.id.toString()} className="flex items-center gap-4 px-6 py-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-300">{lesson.position + 1}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium text-white">{lesson.title}</h3><p className="mt-1 truncate text-xs text-slate-500">{lesson.modules.courses.title} / {lesson.modules.title} · {lesson._count.videos} videos · {lesson._count.lesson_files} files</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${lesson.published ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>{lesson.published ? "Published" : "Draft"}</span></div>)}</div> : <div className="px-6 py-14 text-center"><Plus className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm text-slate-500">No lessons have been created yet.</p></div>}
          </section>

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="mb-5"><h2 className="font-bold text-white">New lesson</h2><p className="mt-1 text-xs text-slate-500">Add a lesson to a module.</p></div><LessonForm modules={modules.map((module) => ({ id: module.id.toString(), label: `${module.courses.title} / ${module.title}` }))} /></section>
        </div>
      </div>
    </main>
  );
}
