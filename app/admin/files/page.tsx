import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileArchive, FileUp, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { FileForm } from "@/components/admin/file-form";

export const metadata: Metadata = {
  title: "Manage Lesson Files",
  robots: { index: false, follow: false },
};

export default async function AdminFilesPage() {
  await requireAdmin();
  const [lessons, files] = await Promise.all([
    db.lesson.findMany({ orderBy: [{ module_id: "asc" }, { position: "asc" }], include: { modules: { select: { title: true, courses: { select: { title: true } } } } } }),
    db.lesson_files.findMany({ orderBy: { created_at: "desc" }, include: { lessons: { select: { title: true, modules: { select: { title: true, courses: { select: { title: true } } } } } } } }),
  ]);

  return (
    <main className="flex-1 px-4 py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Media management</p><h1 className="mt-1 text-3xl font-black text-white">Lesson files</h1><p className="mt-2 text-sm text-slate-400">Attach worksheets, audio, images, and documents to lessons.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"><FileArchive className="h-3.5 w-3.5 text-amber-400" />{files.length} total</span></div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"><div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4"><FileUp className="h-5 w-5 text-amber-400" /><div><h2 className="font-bold text-white">File library</h2><p className="text-xs text-slate-500">Allowed types are validated on the server</p></div></div>{files.length > 0 ? <div className="divide-y divide-slate-800/80">{files.map((file) => <div key={file.id.toString()} className="flex items-center gap-4 px-6 py-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"><FileArchive className="h-4 w-4" /></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium text-white">{file.name}</h3><p className="mt-1 truncate text-xs text-slate-500">{file.lessons.modules.courses.title} / {file.lessons.title} · {file.file_type} · {file.file_size?.toString()} bytes</p></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Ready</span></div>)}</div> : <div className="px-6 py-14 text-center"><Plus className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm text-slate-500">No lesson files have been attached yet.</p></div>}</section>
          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="mb-5"><h2 className="font-bold text-white">Attach a file</h2><p className="mt-1 text-xs text-slate-500">Use a private or signed URL from your storage provider.</p></div><FileForm lessons={lessons.map((lesson) => ({ id: lesson.id.toString(), label: `${lesson.modules.courses.title} / ${lesson.modules.title} / ${lesson.title}` }))} /></section>
        </div>
      </div>
    </main>
  );
}
