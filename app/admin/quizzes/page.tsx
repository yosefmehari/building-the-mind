import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { QuizForm } from "@/components/admin/quiz-form";

export const metadata: Metadata = { title: "Manage Quizzes", robots: { index: false, follow: false } };

export default async function AdminQuizzesPage() {
  await requireAdmin();
  const [lessons, quizzes] = await Promise.all([
    db.lesson.findMany({ orderBy: [{ module_id: "asc" }, { position: "asc" }], include: { modules: { select: { title: true, courses: { select: { title: true } } } } } }),
    db.quiz.findMany({ orderBy: { updated_at: "desc" }, include: { lessons: { select: { title: true, modules: { select: { title: true, courses: { select: { title: true } } } } } }, _count: { select: { questions: true } } } }),
  ]);

  return (
    <main className="flex-1 px-4 py-14"><div className="mx-auto max-w-6xl space-y-8"><Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Dashboard</Link><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">Assessment management</p><h1 className="mt-1 text-3xl font-black text-white">Quizzes</h1><p className="mt-2 text-sm text-slate-400">Create assessments and author their questions.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"><ClipboardCheck className="h-3.5 w-3.5 text-rose-400" />{quizzes.length} total</span></div><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"><div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4"><ClipboardCheck className="h-5 w-5 text-rose-400" /><div><h2 className="font-bold text-white">Quiz library</h2><p className="text-xs text-slate-500">Draft and published assessments</p></div></div>{quizzes.length > 0 ? <div className="divide-y divide-slate-800/80">{quizzes.map((quiz) => <div key={quiz.id.toString()} className="flex items-center gap-4 px-6 py-4"><div className="min-w-0 flex-1"><Link href={`/admin/quizzes/${quiz.id.toString()}/questions`} className="truncate text-sm font-medium text-white transition hover:text-rose-300">{quiz.title}</Link><p className="mt-1 truncate text-xs text-slate-500">{quiz.lessons.modules.courses.title} / {quiz.lessons.title} · {quiz._count.questions} questions</p></div><Link href={`/admin/quizzes/${quiz.id.toString()}/questions`} className="text-xs font-medium text-rose-300">Questions</Link><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${quiz.published ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>{quiz.published ? "Published" : "Draft"}</span></div>)}</div> : <div className="px-6 py-14 text-center"><Plus className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm text-slate-500">No quizzes have been created yet.</p></div>}</section><section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="mb-5"><h2 className="font-bold text-white">New quiz</h2><p className="mt-1 text-xs text-slate-500">Create an assessment for a lesson.</p></div><QuizForm lessons={lessons.map((lesson) => ({ id: lesson.id.toString(), label: `${lesson.modules.courses.title} / ${lesson.modules.title} / ${lesson.title}` }))} /></section></div></div></main>
  );
}
