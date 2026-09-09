import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Film, PlayCircle, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { VideoForm } from "@/components/admin/video-form";

export const metadata: Metadata = {
  title: "Manage Videos",
  robots: { index: false, follow: false },
};

export default async function AdminVideosPage() {
  await requireAdmin();
  const [lessons, videos] = await Promise.all([
    db.lesson.findMany({ orderBy: [{ module_id: "asc" }, { position: "asc" }], include: { modules: { select: { title: true, courses: { select: { title: true } } } } } }),
    db.videos.findMany({ orderBy: { updated_at: "desc" }, include: { lessons: { select: { title: true, modules: { select: { title: true, courses: { select: { title: true } } } } } } } }),
  ]);

  return (
    <main className="flex-1 px-4 py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">Media management</p><h1 className="mt-1 text-3xl font-black text-white">Videos</h1><p className="mt-2 text-sm text-slate-400">Attach hosted video content to lessons. Upload-provider integration comes next.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"><Film className="h-3.5 w-3.5 text-sky-400" />{videos.length} total</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4"><PlayCircle className="h-5 w-5 text-sky-400" /><div><h2 className="font-bold text-white">Video library</h2><p className="text-xs text-slate-500">Hosted video metadata and publication status</p></div></div>
            {videos.length > 0 ? <div className="divide-y divide-slate-800/80">{videos.map((video) => <div key={video.id.toString()} className="flex items-center gap-4 px-6 py-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400"><Film className="h-4 w-4" /></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium text-white">{video.title}</h3><p className="mt-1 truncate text-xs text-slate-500">{video.lessons.modules.courses.title} / {video.lessons.title} · {video.duration_seconds ?? 0}s</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${video.published ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>{video.published ? "Published" : "Draft"}</span></div>)}</div> : <div className="px-6 py-14 text-center"><Plus className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm text-slate-500">No videos have been attached yet.</p></div>}
          </section>

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="mb-5"><h2 className="font-bold text-white">Attach a video</h2><p className="mt-1 text-xs text-slate-500">Use a private or signed URL from your storage provider.</p></div><VideoForm lessons={lessons.map((lesson) => ({ id: lesson.id.toString(), label: `${lesson.modules.courses.title} / ${lesson.modules.title} / ${lesson.title}` }))} /></section>
        </div>
      </div>
    </main>
  );
}
