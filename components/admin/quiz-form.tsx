"use client";

import { useActionState } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import { createQuiz, type QuizFormState } from "@/app/actions/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LessonOption = { id: string; label: string };

export function QuizForm({ lessons }: { lessons: LessonOption[] }) {
  const [state, action, pending] = useActionState<QuizFormState | undefined, FormData>(createQuiz, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5"><label htmlFor="lessonId" className="block text-xs font-medium text-slate-300">Lesson</label><select id="lessonId" name="lessonId" required defaultValue="" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"><option value="" disabled>Select a lesson</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label}</option>)}</select></div>
      <Input label="Quiz title" name="title" placeholder="Module review" minLength={2} maxLength={255} required leftIcon={<ClipboardCheck className="h-4 w-4" />} />
      <div className="space-y-1.5"><label htmlFor="description" className="block text-xs font-medium text-slate-300">Description</label><textarea id="description" name="description" rows={3} placeholder="What should students demonstrate?" className="w-full resize-y rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
      <div className="space-y-1.5"><label htmlFor="completionScope" className="block text-xs font-medium text-slate-300">Exam required for</label><select id="completionScope" name="completionScope" defaultValue="lesson" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"><option value="lesson">This lesson</option><option value="module">This module</option><option value="course">This course</option></select><p className="text-xs text-amber-300">Every posted lesson must have a required exam.</p></div>
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending || lessons.length === 0} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Create draft quiz</Button>
      {lessons.length === 0 && <p className="text-xs text-amber-300">Create a lesson first.</p>}
    </form>
  );
}
