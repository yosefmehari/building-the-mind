"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Play,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  HardDrive,
  FileVideo,
  Plus,
  X,
  Search,
  BookOpen,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { toggleVideoPublished, deleteVideo } from "@/app/actions/videos";

export interface CourseHierarchy {
  id: string;
  title: string;
  slug: string;
  video_url?: string | null;
  modules: Array<{
    id: string;
    title: string;
    position: number;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      position: number;
    }>;
  }>;
}

export interface VideoRecord {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  file_size: string | null;
  storage_provider: string | null;
  published: boolean;
  created_at: string;
  lesson: {
    id: string;
    title: string;
    slug: string;
    moduleTitle: string;
    courseTitle: string;
    courseSlug: string;
  };
}

interface VideoUploadManagerProps {
  courses: CourseHierarchy[];
  videos: VideoRecord[];
}

export function VideoUploadManager({ courses, videos }: VideoUploadManagerProps) {
  const router = useRouter();
  // Upload Target: Course Title Video vs Module Lesson
  const [uploadTarget, setUploadTarget] = useState<"lesson" | "course_title">("lesson");

  // Selection states for Course -> Module -> Lesson
  const initialCourse = courses[0];
  const initialModule = initialCourse?.modules[0];
  const initialLesson = initialModule?.lessons[0];

  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourse?.id ?? "");
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModule?.id ?? "");
  const [lessonMode, setLessonMode] = useState<"existing" | "new">(initialLesson ? "existing" : "new");
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLesson?.id ?? "");
  const [newLessonTitle, setNewLessonTitle] = useState<string>("");

  // Video Form & File states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [published, setPublished] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Upload progress & UI states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Video Player Preview Modal
  const [previewModalVideo, setPreviewModalVideo] = useState<{
    url: string;
    title: string;
    lessonTitle: string;
  } | null>(null);

  // Video Library Filters
  const [filterCourseId, setFilterCourseId] = useState<string>("all");
  const [filterModuleId, setFilterModuleId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Computed: current selected course & its modules
  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const availableModules = currentCourse?.modules ?? [];

  // Computed: current selected module & its lessons
  const currentModule = availableModules.find((m) => m.id === selectedModuleId);
  const availableLessons = currentModule?.lessons ?? [];

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const targetCourse = courses.find((c) => c.id === courseId);
    const firstModule = targetCourse?.modules[0];
    const modId = firstModule?.id ?? "";
    setSelectedModuleId(modId);
    const firstLesson = firstModule?.lessons[0];
    if (firstLesson) {
      setSelectedLessonId(firstLesson.id);
      setLessonMode("existing");
    } else {
      setSelectedLessonId("");
      setLessonMode("new");
    }
  };

  const handleModuleChange = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const mod = availableModules.find((m) => m.id === moduleId);
    const firstLesson = mod?.lessons[0];
    if (firstLesson) {
      setSelectedLessonId(firstLesson.id);
      setLessonMode("existing");
    } else {
      setSelectedLessonId("");
      setLessonMode("new");
    }
  };

  // Handle Video File Selection from Device
  const handleVideoFileChange = (file: File | null) => {
    if (!file) {
      setVideoFile(null);
      setVideoPreviewUrl(null);
      return;
    }

    setVideoFile(file);
    const objUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objUrl);

    // Auto-detect duration from video metadata
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = objUrl;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration && !isNaN(tempVideo.duration)) {
        const secs = Math.round(tempVideo.duration);
        setDurationSeconds(secs);
      }
    };

    // Auto-populate video title if empty
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/^[\d_-]+/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      setTitle(capitalized || file.name);
    }

    // Auto-populate new lesson title if in new mode and empty
    if (lessonMode === "new" && !newLessonTitle.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/^[\d_-]+/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      setNewLessonTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  // Submit Upload to /api/upload/video with real-time progress
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!videoFile) {
      setErrorMessage("Please select a video file from your device.");
      return;
    }

    if (uploadTarget === "course_title") {
      if (!selectedCourseId) {
        setErrorMessage("Please select a target course for the title video.");
        return;
      }
    } else {
      if (!title.trim()) {
        setErrorMessage("Please enter a title for the video.");
        return;
      }
      if (lessonMode === "existing" && !selectedLessonId) {
        setErrorMessage("Please select an existing lesson or choose 'Create new lesson'.");
        return;
      }
      if (lessonMode === "new" && (!newLessonTitle.trim() || !selectedModuleId)) {
        setErrorMessage("Please enter a title for the new lesson and select a module.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("uploadTarget", uploadTarget);
    formData.append("courseId", selectedCourseId);

    if (uploadTarget === "course_title") {
      formData.append("title", title.trim() || `${currentCourse?.title ?? "Course"} - Preview Video`);
    } else {
      formData.append("moduleId", selectedModuleId);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("durationSeconds", durationSeconds.toString());
      formData.append("published", published ? "true" : "false");

      if (lessonMode === "new") {
        formData.append("lessonId", "new");
        formData.append("newLessonTitle", newLessonTitle.trim());
      } else {
        formData.append("lessonId", selectedLessonId);
      }
    }

    if (videoFile) {
      formData.append("video", videoFile);
    }

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText("Starting upload...");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/video");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
        const uploadedMb = (event.loaded / (1024 * 1024)).toFixed(1);
        const totalMb = (event.total / (1024 * 1024)).toFixed(1);
        setUploadStatusText(`Uploading from device: ${percent}% (${uploadedMb} MB / ${totalMb} MB)`);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.success) {
          setSuccessMessage(res.message || "Video successfully uploaded and attached!");
          // Reset file inputs
          setVideoFile(null);
          setVideoPreviewUrl(null);
          setThumbnailFile(null);
          setTitle("");
          setDescription("");
          setDurationSeconds(0);
          setNewLessonTitle("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          if (thumbInputRef.current) thumbInputRef.current.value = "";
          router.refresh();
        } else {
          setErrorMessage(res.error || "Failed to upload video.");
        }
      } catch {
        setErrorMessage("Unexpected server response. Please check file size.");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setErrorMessage("Network error during upload. Please try again.");
    };

    xhr.send(formData);
  };

  // Filtered Videos for Library
  const filteredVideos = videos.filter((v) => {
    if (filterCourseId !== "all") {
      const matchCourse = courses.find((c) => c.id === filterCourseId);
      if (matchCourse && v.lesson.courseSlug !== matchCourse.slug) return false;
    }
    if (filterModuleId !== "all" && v.lesson.moduleTitle !== filterModuleId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchLesson = v.lesson.title.toLowerCase().includes(q);
      const matchCourse = v.lesson.courseTitle.toLowerCase().includes(q);
      if (!matchTitle && !matchLesson && !matchCourse) return false;
    }
    return true;
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds || seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const formatBytes = (bytesStr: string | null) => {
    if (!bytesStr) return null;
    const num = Number(bytesStr);
    if (!num || isNaN(num)) return null;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Video Preview Modal */}
      {previewModalVideo && (
        <Dialog
          isOpen={Boolean(previewModalVideo)}
          onClose={() => setPreviewModalVideo(null)}
          title={previewModalVideo.title}
          description={`Attached to: ${previewModalVideo.lessonTitle}`}
          confirmText=""
          cancelText="Close Player"
        >
          <div className="overflow-hidden rounded-xl bg-black border border-slate-800 shadow-2xl aspect-video w-full flex items-center justify-center">
            <video
              src={previewModalVideo.url}
              controls
              autoPlay
              className="w-full h-full max-h-[60vh] object-contain"
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        </Dialog>
      )}

      {/* Grid: Left Column Video Library / Right Column Device Upload */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* LEFT: Video Library with Course & Module Filter */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="h-4 w-4 text-sky-400 fill-sky-400" />
                  Video Library
                </h2>
                <p className="text-xs text-slate-400">
                  {filteredVideos.length} of {videos.length} videos displayed
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title or lesson..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Course & Module Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Filter by Course</label>
                <select
                  value={filterCourseId}
                  onChange={(e) => {
                    setFilterCourseId(e.target.value);
                    setFilterModuleId("all");
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="all">All Courses ({courses.length})</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Filter by Module</label>
                <select
                  value={filterModuleId}
                  onChange={(e) => setFilterModuleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="all">All Modules</option>
                  {(filterCourseId === "all"
                    ? courses.flatMap((c) => c.modules)
                    : courses.find((c) => c.id === filterCourseId)?.modules ?? []
                  ).map((m) => (
                    <option key={m.id} value={m.title}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Course Title Videos Highlight Section */}
          <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="h-4 w-4 text-sky-400" />
                Course Title Preview Videos
              </h3>
              <span className="text-[11px] text-sky-300">
                {courses.filter((c) => Boolean(c.video_url)).length} of {courses.length} courses have title videos
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courses.map((course) => {
                const hasVideo = Boolean(course.video_url);
                return (
                  <div
                    key={course.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      hasVideo
                        ? "border-sky-500/30 bg-slate-900/80"
                        : "border-slate-800 bg-slate-950/40 opacity-70"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{course.title}</p>
                      <p className="text-[10px] text-slate-400">/{course.slug}</p>
                    </div>
                    {hasVideo ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModalVideo({
                            url: course.video_url!,
                            title: course.title,
                            lessonTitle: "Course Title Preview Video",
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-500/15 border border-sky-500/30 px-2 py-1 text-[11px] font-medium text-sky-300 hover:bg-sky-500/25 transition shrink-0"
                      >
                        <Play className="h-3 w-3 fill-sky-400" /> Play
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleCourseChange(course.id);
                          setUploadTarget("course_title");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition shrink-0"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Videos List */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            {filteredVideos.length > 0 ? (
              <div className="divide-y divide-slate-800/80">
                {filteredVideos.map((video) => {
                  const fileSizeFormatted = formatBytes(video.file_size);
                  return (
                    <div
                      key={video.id}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Play / Thumbnail trigger */}
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModalVideo({
                              url: video.video_url,
                              title: video.title,
                              lessonTitle: video.lesson.title,
                            })
                          }
                          className="relative h-12 w-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 group-hover:bg-sky-500/25 transition shrink-0 shadow-md"
                          title="Click to preview video"
                        >
                          <Play className="h-5 w-5 fill-sky-400" />
                        </button>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white text-sm truncate">
                              {video.title}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                video.published
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {video.published ? "Published" : "Draft"}
                            </span>
                            {video.storage_provider === "local" ? (
                              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300 flex items-center gap-1">
                                <HardDrive className="w-2.5 h-2.5" />
                                Device Upload
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                External URL
                              </span>
                            )}
                          </div>

                          {/* Breadcrumb: Course > Module > Lesson */}
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                            <span className="text-indigo-300 font-medium">{video.lesson.courseTitle}</span>
                            <span>›</span>
                            <span className="text-slate-300">{video.lesson.moduleTitle}</span>
                            <span>›</span>
                            <span className="text-sky-300 font-medium">{video.lesson.title}</span>
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(video.duration_seconds)}
                            </span>
                            {fileSizeFormatted && (
                              <span>• {fileSizeFormatted}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Toggle Published */}
                        <form action={toggleVideoPublished}>
                          <input type="hidden" name="videoId" value={video.id} />
                          <button
                            type="submit"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                              video.published
                                ? "border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            }`}
                            title={video.published ? "Unpublish video" : "Publish video to students"}
                          >
                            {video.published ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                Publish
                              </>
                            )}
                          </button>
                        </form>

                        {/* Delete Video */}
                        <form
                          action={deleteVideo}
                          onSubmit={(e) => {
                            if (!window.confirm(`Delete video "${video.title}"?`)) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="videoId" value={video.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition"
                            title="Delete this video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-16 text-center space-y-3">
                <FileVideo className="mx-auto h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-400 font-medium">No videos found for this filter.</p>
                <p className="text-xs text-slate-500">
                  Select a course and module on the right to upload your device videos.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Upload Video from Device for Course & Module */}
        <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <UploadCloud className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-white text-base">
                  {uploadTarget === "course_title" ? "Upload Course Title Video" : "Upload Lesson Video"}
                </h2>
                <p className="text-xs text-slate-400">
                  {uploadTarget === "course_title"
                    ? "Attach an intro / trailer video to the course title header."
                    : "Select course, module, and upload your lesson file."}
                </p>
              </div>
            </div>

            {/* Target Mode Selector Tabs */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setUploadTarget("lesson")}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                  uploadTarget === "lesson"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                Lesson Video
              </button>
              <button
                type="button"
                onClick={() => setUploadTarget("course_title")}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                  uploadTarget === "course_title"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Film className="h-3.5 w-3.5" />
                Course Title Video
              </button>
            </div>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Step 1: Select Course */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                {uploadTarget === "course_title" ? "Select Course for Title Video" : "1. Target Course"}
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                disabled={isUploading}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} {course.video_url ? "(✓ Has Title Video)" : ""}
                  </option>
                ))}
              </select>
              {uploadTarget === "course_title" && currentCourse?.video_url && (
                <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-2 text-xs text-sky-300 flex items-center justify-between">
                  <span>Current title video active</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalVideo({
                        url: currentCourse.video_url!,
                        title: currentCourse.title,
                        lessonTitle: "Course Title Video",
                      })
                    }
                    className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:underline"
                  >
                    <Play className="h-3 w-3" /> Preview
                  </button>
                </div>
              )}
            </div>

            {/* If Lesson: Step 2 and Step 3 */}
            {uploadTarget === "lesson" && (
              <>
                {/* Step 2: Select Module */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    2. Target Module
                  </label>
                  {availableModules.length > 0 ? (
                    <select
                      value={selectedModuleId}
                      onChange={(e) => handleModuleChange(e.target.value)}
                      disabled={isUploading}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                      {availableModules.map((m, idx) => (
                        <option key={m.id} value={m.id}>
                          Module {idx + 1}: {m.title} ({m.lessons.length} lessons)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs text-amber-300">
                      No modules created for this course yet.
                    </div>
                  )}
                </div>

                {/* Step 3: Select or Create Lesson */}
                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">3. Target Lesson</label>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setLessonMode("existing")}
                        disabled={availableLessons.length === 0}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md transition ${
                          lessonMode === "existing"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Existing Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => setLessonMode("new")}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md transition ${
                          lessonMode === "new"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        + New Lesson
                      </button>
                    </div>
                  </div>

                  {lessonMode === "existing" ? (
                    availableLessons.length > 0 ? (
                      <select
                        value={selectedLessonId}
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                        disabled={isUploading}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
                      >
                        {availableLessons.map((l, li) => (
                          <option key={l.id} value={l.id}>
                            Lesson {li + 1}: {l.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No existing lessons in this module.</p>
                    )
                  ) : (
                    <div className="space-y-1">
                      <Input
                        label=""
                        placeholder="New lesson title (e.g. Introduction to Flexbox)"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        disabled={isUploading}
                        required
                      />
                      <p className="text-[10px] text-slate-500">
                        A new lesson will be created in this module and linked with this video.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 4: Device File Upload Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {uploadTarget === "course_title" ? "2. Course Title Video File" : "4. Video File from Device"}
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                onChange={(e) => handleVideoFileChange(e.target.files?.[0] || null)}
                className="hidden"
                disabled={isUploading}
              />

              {videoFile ? (
                <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                        <FileVideo className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{videoFile.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          {durationSeconds > 0 && ` • ${formatDuration(durationSeconds)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVideoFileChange(null)}
                      disabled={isUploading}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* HTML5 Preview */}
                  {videoPreviewUrl && (
                    <div className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video max-h-36">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleVideoFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className="p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-500/70 bg-slate-950/50 hover:bg-sky-500/5 transition cursor-pointer text-center space-y-2 group"
                >
                  <div className="mx-auto h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Click to choose video from device or drag here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      MP4, WebM, MOV, MKV up to 1 GB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Title */}
            <Input
              label={uploadTarget === "course_title" ? "Course Title Video Label (optional)" : "Video Title"}
              placeholder={
                uploadTarget === "course_title"
                  ? `${currentCourse?.title ?? "Course"} - Preview Trailer`
                  : "e.g. Setting up your developer environment"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              required={uploadTarget === "lesson"}
            />

            {/* Video Duration (Seconds) */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Duration (seconds)"
                type="number"
                min={0}
                value={durationSeconds.toString()}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10) || 0)}
                disabled={isUploading}
                helperText={durationSeconds > 0 ? `~ ${formatDuration(durationSeconds)}` : "Auto-detected"}
              />

              {/* Optional Thumbnail */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Thumbnail (optional)
                </label>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full text-left truncate rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs text-slate-300 hover:border-slate-700 transition"
                >
                  {thumbnailFile ? thumbnailFile.name : "Upload image poster"}
                </button>
              </div>
            </div>

            {/* Published Toggle */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Publish to Students</p>
                <p className="text-[11px] text-slate-500">
                  {published ? "Available immediately on lesson page" : "Saved as draft"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublished(!published)}
                disabled={isUploading}
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

            {/* Progress Bar during upload */}
            {isUploading && (
              <div className="space-y-2 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-300">{uploadStatusText}</span>
                  <span className="font-bold text-sky-400">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-sky-500 transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status messages */}
            {errorMessage && (
              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUploading || !videoFile}
              isLoading={isUploading}
              size="lg"
              className="w-full shadow-lg shadow-sky-500/15"
              leftIcon={isUploading ? undefined : <UploadCloud className="h-4 w-4" />}
            >
              {isUploading
                ? "Uploading video..."
                : uploadTarget === "course_title"
                ? "Upload & Set Course Title Video"
                : "Upload & Attach Video"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
