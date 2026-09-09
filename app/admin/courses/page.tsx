import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CourseForm } from "@/components/admin/course-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCourse } from "@/app/actions/courses";

export const metadata: Metadata = {
  title: "Manage Courses",
  robots: { index: false, follow: false },
};

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await db.course.findMany({
    orderBy: { updated_at: "desc" },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  return (
    <main className="flex-1 px-4 py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Content management</p>
            <h1 className="mt-1 text-3xl font-black text-white">Courses</h1>
            <p className="mt-2 text-sm text-slate-400">Create and review the learning tracks in your catalog.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"><GraduationCap className="h-3.5 w-3.5 text-indigo-400" />{courses.length} total</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4"><BookOpen className="h-5 w-5 text-indigo-400" /><div><h2 className="font-bold text-white">Course catalog</h2><p className="text-xs text-slate-500">Drafts and published courses</p></div></div>
            {courses.length > 0 ? <div className="divide-y divide-slate-800/80">{courses.map((course) => <div key={course.id.toString()} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><h3 className="truncate font-medium text-white">{course.title}</h3><p className="mt-1 text-xs text-slate-500">/{course.slug} · {course._count.modules} modules · {course._count.enrollments} students</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${course.published ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>{course.published ? "Published" : "Draft"}</span><DeleteButton action={deleteCourse} field="courseId" id={course.id.toString()} label={course.title} /></div>)}</div> : <div className="px-6 py-14 text-center"><Plus className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm text-slate-500">Your catalog is empty.</p></div>}
          </section>

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="mb-5"><h2 className="font-bold text-white">New course</h2><p className="mt-1 text-xs text-slate-500">Start with the basic course details.</p></div><CourseForm /></section>
        </div>
      </div>
    </main>
  );
}
