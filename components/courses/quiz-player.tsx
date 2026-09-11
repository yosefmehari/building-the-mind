"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { submitQuiz, type QuizResult } from "@/app/actions/quiz-attempts";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/app/actions/progress";

type QuizQuestion = { id: string; question: string; answers: { id: string; answer: string }[] };

type Quiz = { id: string; title: string; description: string | null; questions: QuizQuestion[] };

export function QuizPlayer({ quiz, signedIn, requiredForCompletion = false, completionTarget }: { quiz: Quiz; signedIn: boolean; requiredForCompletion?: boolean; completionTarget?: { lessonId: string; courseSlug: string; lessonSlug: string } }) {
  const [state, action, pending] = useActionState<QuizResult | undefined, FormData>(submitQuiz, undefined);
  const [completionError, setCompletionError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.score === undefined || !requiredForCompletion || !completionTarget) return;
    let cancelled = false;
    void markLessonComplete(completionTarget.lessonId, completionTarget.courseSlug, completionTarget.lessonSlug).then((result) => {
      if (cancelled) return;
      if (result.error) setCompletionError(result.error);
      else window.location.reload();
    });
    return () => { cancelled = true; };
  }, [state?.score, requiredForCompletion, completionTarget]);

  if (!signedIn) return <section className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6"><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-rose-300" /><h2 className="font-bold text-white">{quiz.title}</h2></div><p className="mt-3 text-sm text-slate-400">Sign in to take this quiz and save your result.</p></section>;

  return <section id={requiredForCompletion ? "required-exam" : undefined} className="scroll-mt-24 rounded-2xl border border-rose-500/20 bg-slate-900/60 p-6"><div className="flex items-start gap-3"><ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" /><div><h2 className="font-bold text-white">{quiz.title}</h2>{requiredForCompletion && <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-amber-300">Required exam</p>}{quiz.description && <p className="mt-1 text-sm text-slate-400">{quiz.description}</p>}</div></div>{state?.score !== undefined ? <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5"><div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-5 w-5" /><span className="font-semibold">Quiz submitted</span></div><p className="mt-2 text-2xl font-black text-white">{state.score} / {state.total}</p><p className="mt-1 text-sm text-slate-400">Your result has been saved.</p>{completionError && <p role="alert" className="mt-3 text-sm text-amber-300">{completionError}</p>}</div> : <form action={action} className="mt-6 space-y-6"><input type="hidden" name="quizId" value={quiz.id} />{quiz.questions.map((question, index) => <fieldset key={question.id} className="space-y-3"><legend className="text-sm font-medium text-slate-200">{index + 1}. {question.question}</legend><div className="grid gap-2 sm:grid-cols-2">{question.answers.map((answer) => <label key={answer.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300 transition hover:border-rose-500/40 has-checked:border-rose-500/50 has-checked:bg-rose-500/10"><input type="radio" name={`question-${question.id}`} value={answer.id} required className="h-4 w-4 accent-rose-500" />{answer.answer}</label>)}</div></fieldset>)}{state?.error && <p role="alert" className="text-sm text-rose-300">{state.error}</p>}<Button type="submit" disabled={pending} isLoading={pending}>Submit quiz</Button></form>}</section>;
}
