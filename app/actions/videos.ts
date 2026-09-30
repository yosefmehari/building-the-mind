"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { saveLocalUpload, deleteLocalUpload } from "@/lib/storage/local";

const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1 GB
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
  "video/x-msvideo",
  "video/mpeg",
]);
const ALLOWED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".mkv",
  ".m4v",
  ".avi",
  ".ogv",
]);

export type VideoFormState = { error?: string; success?: string };

export async function createVideo(
  _state: VideoFormState | undefined,
  formData: FormData
): Promise<VideoFormState> {
  await requireAdmin();

  const lessonIdValue = String(formData.get("lessonId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const uploadedVideo = formData.get("video");
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const durationValue = String(formData.get("durationSeconds") ?? "0").trim();
  const published = formData.get("published") === "true";

  if (!/^\d+$/.test(lessonIdValue) || title.length < 2 || title.length > 255) {
    return { error: "Choose a lesson and enter a title between 2 and 255 characters." };
  }

  const hasVideoFile = uploadedVideo instanceof File && uploadedVideo.size > 0;
  if (!hasVideoFile && !isHttpUrl(videoUrl)) {
    return { error: "Choose a video file from your device or enter a valid hosted video URL." };
  }
  if (thumbnailUrl && !isHttpUrl(thumbnailUrl) && !thumbnailUrl.startsWith("/uploads/")) {
    return { error: "Thumbnail URL must be valid." };
  }

  const durationSeconds = Number(durationValue);
  if (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 86400) {
    return { error: "Duration must be a whole number between 0 and 86400 seconds." };
  }

  let finalVideoUrl = videoUrl;
  let storageProvider = "external";
  let fileSize: number | null = null;
  let mimeType: string | null = null;

  if (hasVideoFile) {
    try {
      const saved = await saveLocalUpload(
        uploadedVideo as File,
        ALLOWED_VIDEO_TYPES,
        MAX_VIDEO_SIZE,
        "videos",
        ALLOWED_VIDEO_EXTENSIONS
      );
      finalVideoUrl = saved.url;
      storageProvider = "local";
      fileSize = saved.size;
      mimeType = saved.mimeType;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Upload failed." };
    }
  }

  const lessonId = BigInt(lessonIdValue);
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, modules: { select: { courses: { select: { slug: true } } } } },
  });
  if (!lesson) return { error: "The selected lesson does not exist." };

  await db.videos.create({
    data: {
      lesson_id: lessonId,
      title,
      video_url: finalVideoUrl,
      thumbnail_url: thumbnailUrl || null,
      duration_seconds: durationSeconds,
      storage_provider: storageProvider,
      file_size: fileSize ? BigInt(fileSize) : null,
      mime_type: mimeType,
      published,
    },
  });

  if (durationSeconds > 0) {
    await db.lesson.update({
      where: { id: lessonId },
      data: { duration_minutes: Math.ceil(durationSeconds / 60) },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/videos");
  revalidatePath("/admin/lessons");
  if (lesson.modules?.courses?.slug) {
    revalidatePath(`/courses/${lesson.modules.courses.slug}`);
  }

  return { success: published ? "Video uploaded and published!" : "Video attached as draft." };
}

export async function toggleVideoPublished(formData: FormData) {
  await requireAdmin();
  const idValue = String(formData.get("videoId") ?? "");
  if (!/^\d+$/.test(idValue)) throw new Error("Invalid video.");

  const video = await db.videos.findUnique({
    where: { id: BigInt(idValue) },
    select: { id: true, published: true, lessons: { select: { modules: { select: { courses: { select: { slug: true } } } } } } },
  });
  if (!video) throw new Error("Video not found.");

  await db.videos.update({
    where: { id: video.id },
    data: { published: !video.published },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/videos");
  revalidatePath("/admin/lessons");
  if (video.lessons?.modules?.courses?.slug) {
    revalidatePath(`/courses/${video.lessons.modules.courses.slug}`);
  }
}

export async function deleteVideo(formData: FormData) {
  await requireAdmin();
  const idValue = String(formData.get("videoId") ?? "");
  if (!/^\d+$/.test(idValue)) throw new Error("Invalid video.");

  const video = await db.videos.findUnique({
    where: { id: BigInt(idValue) },
    select: { id: true, video_url: true, storage_provider: true, lessons: { select: { modules: { select: { courses: { select: { slug: true } } } } } } },
  });
  if (!video) throw new Error("Video not found.");

  // If stored locally, delete file from disk
  if (video.storage_provider === "local" && video.video_url) {
    await deleteLocalUpload(video.video_url);
  }

  await db.videos.delete({ where: { id: video.id } });

  revalidatePath("/admin");
  revalidatePath("/admin/videos");
  revalidatePath("/admin/lessons");
  if (video.lessons?.modules?.courses?.slug) {
    revalidatePath(`/courses/${video.lessons.modules.courses.slug}`);
  }
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
