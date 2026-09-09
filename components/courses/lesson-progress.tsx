"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { markLessonComplete } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";

export function LessonProgress({ lessonId, courseSlug, lessonSlug, completed, signedIn }: { lessonId: string; courseSlug: string; lessonSlug: string; completed: boolean; signedIn: boolean }) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function completeLesson() {
    setError(null);
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, courseSlug, lessonSlug);
      if (result.error) setError(result.error);
      else setIsCompleted(true);
    });
  }

  if (isCompleted) {
    return <div className="flex items-center gap-2 text-sm font-medium text-emerald-300"><CheckCircle2 className="h-5 w-5" />Lesson completed</div>;
  }
  if (!signedIn) return <p className="text-xs text-slate-500">Sign in to save your progress.</p>;

  return <div className="space-y-2"><Button type="button" variant="secondary" size="sm" onClick={completeLesson} disabled={isPending} isLoading={isPending} leftIcon={isPending ? undefined : <CheckCircle2 className="h-4 w-4" />}>Mark complete</Button>{error && <p role="alert" className="text-xs text-rose-300">{error}</p>}</div>;
}
