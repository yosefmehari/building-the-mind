import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardCheck, ListChecks } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { QuestionForm } from "@/components/admin/question-form";

interface Props { params: Promise<{ quizId: string }> }

export const metadata: Metadata = { title: "Manage Quiz Questions", robots: { index: false, follow: false } };

export default async function AdminQuestionsPage({ params }: Props) {
  await requireAdmin();
  const { quizId } = await params;
  if (!/^\d+$/.test(quizId)) notFound();

  const quiz = await db.quiz.findUnique({
    where: { id: BigInt(quizId) },
    include: {
      lessons: { select: { title: true, modules: { select: { title: true, courses: { select: { title: true } } } } } },
      questions: { orderBy: { position: "asc" }, include: { answers: { orderBy: { id: "asc" } } } },
    },
  });
  if (!quiz) notFound();

  return (
    <main className="flex-1 px-4 py-14"><div className="mx-auto max-w-6xl space-y-8"><Link href="/admin/quizzes" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Quizzes</Link><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">Question authoring</p><h1 className="mt-1 text-3xl font-black text-white">{quiz.title}</h1><p className="mt-2 text-sm text-slate-400">{quiz.lessons.modules.courses.title} / {quiz.lessons.modules.title} / {quiz.lessons.title}</p></div><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]"><section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"><div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4"><ListChecks className="h-5 w-5 text-rose-400" /><div><h2 className="font-bold text-white">Questions</h2><p className="text-xs text-slate-500">{quiz.questions.length} authored</p></div></div>{quiz.questions.length > 0 ? <div className="divide-y divide-slate-800/80">{quiz.questions.map((question, index) => <div key={question.id.toString()} className="space-y-3 px-6 py-5"><div className="flex gap-3"><span className="text-xs font-bold text-rose-300">{index + 1}</span><p className="text-sm font-medium text-white">{question.question}</p></div><div className="ml-5 grid gap-2 sm:grid-cols-2">{question.answers.map((answer) => <div key={answer.id.toString()} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${answer.is_correct ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-800 text-slate-400"}`}>{answer.is_correct && <CheckCircle2 className="h-3.5 w-3.5" />}{answer.answer}</div>)}</div></div>)}</div> : <div className="px-6 py-14 text-center"><ClipboardCheck className="mx-auto h-8 w-8 text-slate-700" /><p className="mt-3 text-sm text-slate-500">No questions yet.</p></div>}</section><section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="mb-5"><h2 className="font-bold text-white">New question</h2><p className="mt-1 text-xs text-slate-500">Add a multiple-choice question and its answers.</p></div><QuestionForm quizId={quizId} /></section></div></div></main>
  );
}
