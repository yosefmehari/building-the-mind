"use client";

import { useActionState } from "react";
import { Plus, WandSparkles } from "lucide-react";
import { createCourse, type CourseFormState } from "@/app/actions/courses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CourseForm() {
  const [state, action, pending] = useActionState<CourseFormState | undefined, FormData>(createCourse, undefined);

  return (
    <form action={action} className="space-y-4">
      <Input label="Course title" name="title" placeholder="Full Stack Web Development" minLength={2} maxLength={255} required />
      <Input label="URL slug" name="slug" placeholder="full-stack" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required helperText="Lowercase words separated by hyphens." />
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-medium text-slate-300">Description</label>
        <textarea id="description" name="description" rows={4} placeholder="What will students learn?" className="w-full resize-y rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
      </div>
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Create draft course</Button>
      <div className="flex items-center gap-2 text-xs text-slate-500"><WandSparkles className="h-3.5 w-3.5 text-indigo-400" />New courses start unpublished until reviewed.</div>
    </form>
  );
}
