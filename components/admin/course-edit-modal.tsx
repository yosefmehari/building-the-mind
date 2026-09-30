"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { Sparkles, Save, CheckCircle2, Film, UploadCloud, Trash2, Loader2 } from "lucide-react";
import { updateCourse, type CourseFormState } from "@/app/actions/courses";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  highlights: string | null;
  video_url?: string | null;
  published: boolean;
  is_free: boolean;
  price: number | null;
  currency: string;
}

export function CourseEditModal({ course }: { course: CourseData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightsText, setHighlightsText] = useState(course.highlights ?? "");
  const [videoUrl, setVideoUrl] = useState(course.video_url ?? "");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(course.is_free);
  const [published, setPublished] = useState(course.published);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState<CourseFormState | undefined, FormData>(
    updateCourse,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  const handleDeviceVideoUpload = async (file: File) => {
    setVideoUploadError(null);
    setVideoUploadSuccess(null);
    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    const formData = new FormData();
    formData.append("uploadTarget", "course_title");
    formData.append("courseId", course.id);
    formData.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/video");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setVideoUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploadingVideo(false);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.success) {
          setVideoUrl(res.video?.video_url ?? res.videoUrl ?? "");
          setVideoUploadSuccess("Video uploaded and attached to course title!");
        } else {
          setVideoUploadError(res.error || "Failed to upload video.");
        }
      } catch {
        setVideoUploadError("Failed to parse upload server response.");
      }
    };

    xhr.onerror = () => {
      setIsUploadingVideo(false);
      setVideoUploadError("Network error occurred during video upload.");
    };

    xhr.send(formData);
  };

  const highlightItems = highlightsText
    .split("\n")
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/20"
      >
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        Highlights & Edit
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Edit "${course.title}"`}
        description="Update course highlights (shown to students before sign in), details, and publish status."
        confirmText=""
        cancelText="Close"
      >
        <form action={formAction} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="published" value={published ? "true" : "false"} />

          <Input
            label="Course title"
            name="title"
            defaultValue={course.title}
            minLength={2}
            maxLength={255}
            required
          />

          <Input
            label="URL slug"
            name="slug"
            defaultValue={course.slug}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            helperText="Lowercase words separated by hyphens."
          />

          <div className="space-y-1.5">
            <label htmlFor={`desc-${course.id}`} className="block text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              id={`desc-${course.id}`}
              name="description"
              defaultValue={course.description ?? ""}
              rows={3}
              placeholder="What will students learn?"
              className="w-full resize-y rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Highlights Section */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor={`highlights-${course.id}`} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Course Highlights (Put highlights here)
              </label>
              <span className="text-[11px] text-slate-400">
                {highlightItems.length} highlight{highlightItems.length === 1 ? "" : "s"}
              </span>
            </div>
            <textarea
              id={`highlights-${course.id}`}
              name="highlights"
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              rows={5}
              placeholder={"Enter key highlights, one per line:\n- Master full-stack web development\n- Hands-on Next.js projects\n- Certificate upon completion"}
              className="w-full resize-y rounded-xl border border-indigo-500/30 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[11px] text-slate-400">
              Students see these highlights on the course page before signing in. Put one takeaway per line.
            </p>

            {/* Live Highlights Preview */}
            {highlightItems.length > 0 && (
              <div className="mt-2 pt-3 border-t border-slate-800/80 space-y-1.5">
                <p className="text-[11px] font-semibold text-indigo-300">Preview of highlights:</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {highlightItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Course Title Video Section */}
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                <Film className="h-4 w-4 text-sky-400" />
                Course Title Video (Trailer / Introduction Video)
              </label>
              {videoUrl ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Video Attached
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Optional</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Students and guests can watch this video preview right under the course title before signing in.
            </p>

            {/* Hidden field to submit with form action */}
            <input type="hidden" name="videoUrl" value={videoUrl} />

            {/* Video Preview Player */}
            {videoUrl ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium truncate max-w-[280px]">
                    {videoUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoUrl("");
                      setVideoUploadSuccess(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove video
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg bg-black aspect-video flex items-center justify-center border border-slate-800">
                  <video
                    src={videoUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : null}

            {/* Device Upload and URL Input */}
            <div className="space-y-2">
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/ogg,video/x-msvideo"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleDeviceVideoUpload(file);
                  }
                  e.target.value = "";
                }}
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  type="button"
                  variant="glass"
                  size="sm"
                  disabled={isUploadingVideo}
                  onClick={() => videoFileInputRef.current?.click()}
                  leftIcon={
                    isUploadingVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                    ) : (
                      <UploadCloud className="h-4 w-4 text-sky-400" />
                    )
                  }
                >
                  {isUploadingVideo
                    ? `Uploading (${videoUploadProgress}%)...`
                    : "Upload Video From Device"}
                </Button>
                <span className="text-xs text-slate-500 self-center">or paste video URL below:</span>
              </div>

              {isUploadingVideo && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-200"
                      style={{ width: `${videoUploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-sky-400">
                    Uploading video file to server... {videoUploadProgress}%
                  </p>
                </div>
              )}

              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/course-intro-video.mp4 or /uploads/videos/..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {videoUploadError && (
              <p className="text-xs text-rose-400">{videoUploadError}</p>
            )}
            {videoUploadSuccess && (
              <p className="text-xs text-emerald-400">{videoUploadSuccess}</p>
            )}
          </div>

          {/* Access & Pricing */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Access & Pricing</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="isFree"
                  value="true"
                  checked={isFree}
                  onChange={() => setIsFree(true)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Free</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="isFree"
                  value="false"
                  checked={!isFree}
                  onChange={() => setIsFree(false)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Paid</span>
              </label>
            </div>
            <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Price amount"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={course.price ?? ""}
                placeholder="e.g. 19.99"
                helperText="Leave blank if free."
              />
              <div className="space-y-1.5">
                <label htmlFor={`currency-${course.id}`} className="block text-xs font-medium text-slate-300">
                  Currency
                </label>
                <select
                  id={`currency-${course.id}`}
                  name="currency"
                  defaultValue={course.currency ?? "USD"}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro (Europe)</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="ETB">ETB (Br) - Ethiopian Birr</option>
                  <option value="ERN">ERN (Nfk) - Eritrean Nakfa</option>
                  <option value="CAD">CAD (CA$) - Canadian Dollar</option>
                  <option value="AUD">AUD (AU$) - Australian Dollar</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Publication Status</p>
              <p className="text-[11px] text-slate-500">
                {published ? "Course is visible to students in catalog" : "Course is hidden as draft"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                published ? "bg-emerald-500" : "bg-slate-700"
              }`}
              role="switch"
              aria-checked={published}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  published ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {state?.error && (
            <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {state.success}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              isLoading={pending}
              leftIcon={pending ? undefined : <Save className="h-4 w-4" />}
            >
              Save Course & Highlights
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
