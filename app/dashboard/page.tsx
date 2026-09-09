import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, LogOut, UserRound } from "lucide-react";
import { requireStudent } from "@/lib/auth/session";
import { studentLogout } from "@/app/actions/student-auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Student Dashboard", robots: { index: false, follow: false } };

export default async function StudentDashboard() {
  const session = await requireStudent();
  const userId = BigInt(session.userId);
  const [user, progress] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true, email: true, enrollments: { include: { courses: { select: { title: true, slug: true, description: true } } } } } }),
    db.student_progress.findMany({ where: { user_id: userId, completed: true }, select: { lesson_id: true } }),
  ]);
  if (!user) return null;

  return <main className="flex-1 px-4 py-14"><div className="mx-auto max-w-5xl space-y-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><UserRound className="h-6 w-6" /></div><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Student dashboard</p><h1 className="mt-1 text-2xl font-black text-white">Welcome back, {user.name}</h1><p className="mt-1 text-sm text-slate-400">{user.email} · {progress.length} completed lessons</p></div><form action={studentLogout}><button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"><LogOut className="h-4 w-4" />Sign out</button></form></div><section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-bold text-white">My courses</h2><p className="mt-1 text-sm text-slate-500">Continue where you left off.</p></div><Link href="/courses" className="text-sm text-indigo-400 hover:text-indigo-300">Browse courses</Link></div>{user.enrollments.length > 0 ? <div className="grid gap-5 md:grid-cols-2">{user.enrollments.map((enrollment) => <Link key={enrollment.id.toString()} href={`/courses/${enrollment.courses.slug}`} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:-translate-y-1 hover:border-indigo-500/40"><BookOpen className="h-6 w-6 text-indigo-400" /><h3 className="mt-5 font-bold text-white group-hover:text-indigo-300">{enrollment.courses.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-400">{enrollment.courses.description ?? "Continue learning in this course."}</p><span className="mt-5 inline-flex items-center gap-2 text-sm text-indigo-400">Continue <ArrowRight className="h-4 w-4" /></span></Link>)}</div> : <div className="rounded-2xl border border-dashed border-slate-800 px-6 py-16 text-center"><BookOpen className="mx-auto h-8 w-8 text-slate-700" /><p className="mt-3 text-sm text-slate-500">You have not enrolled in a course yet.</p><Link href="/courses" className="mt-4 inline-flex text-sm text-indigo-400 hover:text-indigo-300">Explore courses</Link></div>}</section></div></main>;
}
