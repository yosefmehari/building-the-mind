"use client";

import { useActionState } from "react";
import { FileUp, Plus } from "lucide-react";
import { createLessonFile, type FileFormState } from "@/app/actions/files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LessonOption = { id: string; label: string };

export function FileForm({ lessons }: { lessons: LessonOption[] }) {
  const [state, action, pending] = useActionState<FileFormState | undefined, FormData>(createLessonFile, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="lessonId" className="block text-xs font-medium text-slate-300">Lesson</label>
        <select id="lessonId" name="lessonId" required defaultValue="" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="" disabled>Select a lesson</option>
          {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label}</option>)}
        </select>
      </div>
      <Input label="File name" name="name" placeholder="Grammar worksheet.pdf" maxLength={255} required leftIcon={<FileUp className="h-4 w-4" />} />
      <Input label="Hosted file URL (optional)" name="fileUrl" type="url" placeholder="https://cdn.example.com/file.pdf" helperText="Or upload a file below." />
      <Input label="Upload file" name="file" type="file" accept="application/pdf,audio/mpeg,audio/wav,audio/ogg,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><label htmlFor="fileType" className="block text-xs font-medium text-slate-300">Hosted file type</label><select id="fileType" name="fileType" defaultValue="" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"><option value="">Select type for hosted URL</option><option value="application/pdf">PDF</option><option value="audio/mpeg">MP3 audio</option><option value="audio/wav">WAV audio</option><option value="audio/ogg">OGG audio</option><option value="image/jpeg">JPEG image</option><option value="image/png">PNG image</option><option value="image/webp">WebP image</option><option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word document</option></select></div>
        <Input label="Hosted size in bytes" name="fileSize" type="number" min={1} max={52428800} helperText="Required only for a hosted URL; uploads are measured automatically." />
      </div>
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending || lessons.length === 0} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Attach file</Button>
      {lessons.length === 0 && <p className="text-xs text-amber-300">Create a lesson first.</p>}
    </form>
  );
}
