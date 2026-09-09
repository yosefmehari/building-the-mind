"use client";

import { useActionState } from "react";
import { Film, Plus } from "lucide-react";
import { createVideo, type VideoFormState } from "@/app/actions/videos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LessonOption = { id: string; label: string };

export function VideoForm({ lessons }: { lessons: LessonOption[] }) {
  const [state, action, pending] = useActionState<VideoFormState | undefined, FormData>(createVideo, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="lessonId" className="block text-xs font-medium text-slate-300">Lesson</label>
        <select id="lessonId" name="lessonId" required defaultValue="" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="" disabled>Select a lesson</option>
          {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label}</option>)}
        </select>
      </div>
      <Input label="Video title" name="title" placeholder="Lesson introduction" minLength={2} maxLength={255} required leftIcon={<Film className="h-4 w-4" />} />
      <Input label="Hosted video URL (optional)" name="videoUrl" type="url" placeholder="https://cdn.example.com/video.mp4" helperText="Or upload an MP4, WebM, or MOV file below." />
      <Input label="Upload video" name="video" type="file" accept="video/mp4,video/webm,video/quicktime" />
      <Input label="Thumbnail URL (optional)" name="thumbnailUrl" type="url" placeholder="https://cdn.example.com/thumbnail.jpg" />
      <Input label="Duration in seconds" name="durationSeconds" type="number" min={0} max={86400} defaultValue={0} required helperText="Use 0 when the hosted provider does not expose duration yet." />
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending || lessons.length === 0} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Attach draft video</Button>
      {lessons.length === 0 && <p className="text-xs text-amber-300">Create a lesson first.</p>}
    </form>
  );
}
