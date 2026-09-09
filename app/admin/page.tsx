import Link from "next/link";
import { BookOpen, Code2, GraduationCap, Shield, LogOut, Layers3, Video, Film, FileArchive, ClipboardCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import { logout } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const ADMIN_SECTIONS = [
  {
    title: "Courses",
    href: "/admin/courses",
    icon: <GraduationCap className="w-6 h-6" />,
    desc: "Create, edit, and publish courses.",
    color: "indigo",
  },
  {
    title: "Modules",
    href: "/admin/modules",
    icon: <BookOpen className="w-6 h-6" />,
    desc: "Organize course modules.",
    color: "violet",
  },
  {
    title: "Lessons",
    href: "/admin/lessons",
    icon: <Code2 className="w-6 h-6" />,
    desc: "Upload videos, PDFs, and manage lessons.",
    color: "emerald",
  },
  { title: "Videos", href: "/admin/videos", icon: <Film className="w-6 h-6" />, desc: "Attach hosted videos to lessons.", color: "sky" },
  { title: "Files", href: "/admin/files", icon: <FileArchive className="w-6 h-6" />, desc: "Manage PDFs, audio, and documents.", color: "amber" },
  { title: "Quizzes", href: "/admin/quizzes", icon: <ClipboardCheck className="w-6 h-6" />, desc: "Create assessments and questions.", color: "rose" },
  { title: "Students", href: "/admin/students", icon: <Users className="w-6 h-6" />, desc: "Review learner activity.", color: "amber" },
];

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const [courseCount, moduleCount, lessonCount, publishedCount, videoCount, fileCount, quizCount, recentCourses] = await Promise.all([
    db.course.count(),
    db.module.count(),
    db.lesson.count(),
    db.course.count({ where: { published: true } }),
    db.videos.count(),
    db.lesson_files.count(),
    db.quiz.count(),
    db.course.findMany({
      orderBy: { updated_at: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, published: true, updated_at: true },
    }),
  ]);

  return (
    <main className="flex-1 py-14 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">Signed in as {session.email}</p>
          </div>
          <form action={logout} className="ml-auto">
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ADMIN_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              id={`admin-nav-${section.title.toLowerCase()}`}
              className="group p-6 rounded-2xl bg-slate-900/65 border border-slate-800 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/8 transition-all duration-300 block space-y-3"
            >
              <div className="h-11 w-11 rounded-xl bg-indigo-600/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                {section.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white">{section.title}</h3>
                <p className="text-sm text-slate-400 mt-0.5">{section.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <section className="space-y-5" aria-labelledby="overview-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Overview</p>
              <h2 id="overview-heading" className="mt-1 text-xl font-bold text-white">Content at a glance</h2>
            </div>
            <span className="text-xs text-slate-500">Live database totals</span>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total courses", value: courseCount, icon: GraduationCap, color: "text-indigo-400" },
              { label: "Published", value: publishedCount, icon: Video, color: "text-emerald-400" },
              { label: "Modules", value: moduleCount, icon: Layers3, color: "text-amber-400" },
              { label: "Lessons", value: lessonCount, icon: BookOpen, color: "text-sky-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <p className="mt-4 text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {[
              { label: "Videos", value: videoCount, icon: Film, color: "text-sky-400", href: "/admin/videos" },
              { label: "Lesson files", value: fileCount, icon: FileArchive, color: "text-amber-400", href: "/admin/files" },
              { label: "Quizzes", value: quizCount, icon: ClipboardCheck, color: "text-rose-400", href: "/admin/quizzes" },
            ].map((stat) => (
              <Link key={stat.label} href={stat.href} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <p className="mt-4 text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60" aria-labelledby="recent-courses-heading">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div>
              <h2 id="recent-courses-heading" className="font-bold text-white">Recently updated courses</h2>
              <p className="mt-1 text-xs text-slate-500">The latest content changes in your catalog.</p>
            </div>
            <Link href="/admin/courses" className="text-sm font-medium text-indigo-400 transition hover:text-indigo-300">Manage courses</Link>
          </div>
          {recentCourses.length > 0 ? (
            <div className="divide-y divide-slate-800/80">
              {recentCourses.map((course) => (
                <div key={course.id.toString()} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{course.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">/{course.slug}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${course.published ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
                    {course.published ? "Published" : "Draft"}
                  </span>
                  <time className="hidden text-xs text-slate-600 sm:block" dateTime={course.updated_at.toISOString()}>
                    {course.updated_at.toLocaleDateString()}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-sm text-slate-500">No courses have been created yet.</div>
          )}
        </section>

      </div>
    </main>
  );
}
