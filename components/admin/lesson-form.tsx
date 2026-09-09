"use client";

import { useActionState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { createLesson, type LessonFormState } from "@/app/actions/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ModuleOption = { id: string; label: string };

export function LessonForm({ modules }: { modules: ModuleOption[] }) {
  const [state, action, pending] = useActionState<LessonFormState | undefined, FormData>(createLesson, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="moduleId" className="block text-xs font-medium text-slate-300">Module</label>
        <select id="moduleId" name="moduleId" required defaultValue="" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="" disabled>Select a module</option>
          {modules.map((module) => <option key={module.id} value={module.id}>{module.label}</option>)}
        </select>
      </div>
      <Input label="Lesson title" name="title" placeholder="What is React?" minLength={2} maxLength={255} required leftIcon={<BookOpen className="h-4 w-4" />} />
      <Input label="URL slug" name="slug" placeholder="what-is-react" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required helperText="Lowercase words separated by hyphens." />
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending || modules.length === 0} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Create draft lesson</Button>
      {modules.length === 0 && <p className="text-xs text-amber-300">Create a module first.</p>}
    </form>
  );
}
