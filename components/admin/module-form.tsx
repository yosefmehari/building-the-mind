"use client";

import { useActionState } from "react";
import { Layers3, Plus } from "lucide-react";
import { createModule, type ModuleFormState } from "@/app/actions/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CourseOption = { id: string; title: string };

export function ModuleForm({ courses }: { courses: CourseOption[] }) {
  const [state, action, pending] = useActionState<ModuleFormState | undefined, FormData>(createModule, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="courseId" className="block text-xs font-medium text-slate-300">Course</label>
        <select id="courseId" name="courseId" required defaultValue="" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="" disabled>Select a course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </div>
      <Input label="Module title" name="title" placeholder="Introduction to React" minLength={2} maxLength={255} required leftIcon={<Layers3 className="h-4 w-4" />} />
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending || courses.length === 0} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Create draft module</Button>
      {courses.length === 0 && <p className="text-xs text-amber-300">Create a course first.</p>}
    </form>
  );
}
