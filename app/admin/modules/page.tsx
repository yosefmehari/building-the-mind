import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers3, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ModuleForm } from "@/components/admin/module-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteModule } from "@/app/actions/modules";

export const metadata: Metadata = {
  title: "Manage Modules",
  robots: { index: false, follow: false },
};

export default async function AdminModulesPage() {
  await requireAdmin();
  const [courses, modules] = await Promise.all([
    db.course.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.module.findMany({
      orderBy: [{ course_id: "asc" }, { position: "asc" }],
      include: { courses: { select: { title: true, slug: true } }, _count: { select: { lessons: true } } },
    }),
  ]);

  return (
    <main className="flex-1 px-4 py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">Content management</p><h1 className="mt-1 text-3xl font-black text-white">Modules</h1><p className="mt-2 text-sm text-slate-400">Organize lessons into clear learning chapters.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"><Layers3 className="h-3.5 w-3.5 text-violet-400" />{modules.length} total</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4"><BookOpen className="h-5 w-5 text-violet-400" /><div><h2 className="font-bold text-white">Module outline</h2><p className="text-xs text-slate-500">Ordered by course and position</p></div></div>
            {modules.length > 0 ? <div className="divide-y divide-slate-800/80">{modules.map((module) => <div key={module.id.toString()} className="flex flex-wrap items-center gap-4 px-6 py-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-300">{module.position + 1}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium text-white">{module.title}</h3><p className="mt-1 truncate text-xs text-slate-500">{module.courses.title} · {module._count.lessons} lessons</p></div><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">Draft</span><DeleteButton action={deleteModule} field="moduleId" id={module.id.toString()} label={module.title} /></div>)}</div> : <div className="px-6 py-14 text-center"><Plus className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm text-slate-500">No modules have been created yet.</p></div>}
          </section>

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="mb-5"><h2 className="font-bold text-white">New module</h2><p className="mt-1 text-xs text-slate-500">Add the next chapter to a course.</p></div><ModuleForm courses={courses.map((course) => ({ id: course.id.toString(), title: course.title }))} /></section>
        </div>
      </div>
    </main>
  );
}
