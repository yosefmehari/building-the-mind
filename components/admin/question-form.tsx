"use client";

import { useActionState } from "react";
import { Check, Plus } from "lucide-react";
import { createQuestion, type QuestionFormState } from "@/app/actions/questions";
import { Button } from "@/components/ui/button";

export function QuestionForm({ quizId }: { quizId: string }) {
  const [state, action, pending] = useActionState<QuestionFormState | undefined, FormData>(createQuestion, undefined);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="quizId" value={quizId} />
      <div className="space-y-1.5"><label htmlFor="question" className="block text-xs font-medium text-slate-300">Question</label><textarea id="question" name="question" rows={3} minLength={5} required placeholder="What does HTML stand for?" className="w-full resize-y rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
      <fieldset className="space-y-3"><legend className="text-xs font-medium text-slate-300">Answer options</legend>{[0, 1, 2, 3].map((index) => <div key={index} className="flex items-center gap-3"><input type="radio" name="correctIndex" value={index} required aria-label={`Mark option ${index + 1} correct`} className="h-4 w-4 accent-emerald-500" /><input name="answers" placeholder={`Option ${index + 1}${index < 2 ? " (required)" : " (optional)"}`} required={index < 2} className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>)}</fieldset>
      <p className="flex items-center gap-2 text-xs text-slate-500"><Check className="h-3.5 w-3.5 text-emerald-400" />Select one radio button as the correct answer.</p>
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Add question</Button>
    </form>
  );
}
