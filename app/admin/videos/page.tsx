import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Film, Eye, Clock } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { VideoUploadManager } from "@/components/admin/video-upload-manager";

export const metadata: Metadata = {
  title: "Manage Videos",
  robots: { index: false, follow: false },
};

export default async function AdminVideosPage() {
  await requireAdmin();

  const [coursesData, videosData] = await Promise.all([
    db.course.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        video_url: true,
        modules: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            position: true,
            lessons: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                slug: true,
                position: true,
              },
            },
          },
        },
      },
    }),
    db.videos.findMany({
      orderBy: { updated_at: "desc" },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            slug: true,
            modules: {
              select: {
                id: true,
                title: true,
                courses: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const courses = coursesData.map((course) => ({
    id: course.id.toString(),
    title: course.title,
    slug: course.slug,
    video_url: course.video_url,
    modules: course.modules.map((m) => ({
      id: m.id.toString(),
      title: m.title,
      position: m.position,
      lessons: m.lessons.map((l) => ({
        id: l.id.toString(),
        title: l.title,
        slug: l.slug,
        position: l.position,
      })),
    })),
  }));

  const videos = videosData.map((v) => ({
    id: v.id.toString(),
    title: v.title,
    description: v.description,
    video_url: v.video_url,
    thumbnail_url: v.thumbnail_url,
    duration_seconds: v.duration_seconds,
    file_size: v.file_size ? v.file_size.toString() : null,
    storage_provider: v.storage_provider,
    published: v.published,
    created_at: v.created_at.toISOString(),
    lesson: {
      id: v.lessons.id.toString(),
      title: v.lessons.title,
      slug: v.lessons.slug,
      moduleTitle: v.lessons.modules.title,
      courseTitle: v.lessons.modules.courses.title,
      courseSlug: v.lessons.modules.courses.slug,
    },
  }));

  const publishedCount = videos.filter((v) => v.published).length;
  const totalDurationSeconds = videos.reduce((acc, v) => acc + (v.duration_seconds ?? 0), 0);
  const totalHours = (totalDurationSeconds / 3600).toFixed(1);

  return (
    <main className="flex-1 px-4 py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Page Header with Stats */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              Media & Video Streaming
            </p>
            <h1 className="mt-1 text-3xl font-black text-white">Course & Module Videos</h1>
            <p className="mt-2 text-sm text-slate-400">
              Upload video lessons directly from your device organized by course and module.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
              <Film className="h-3.5 w-3.5 text-sky-400" />
              {videos.length} videos
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
              <Eye className="h-3.5 w-3.5 text-emerald-400" />
              {publishedCount} published
            </span>
            {totalDurationSeconds > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                {totalHours} hrs content
              </span>
            )}
          </div>
        </div>

        {/* Video Upload Manager Component */}
        <VideoUploadManager courses={courses} videos={videos} />
      </div>
    </main>
  );
}
