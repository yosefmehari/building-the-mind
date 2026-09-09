"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { saveLocalUpload } from "@/lib/storage/local";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type VideoFormState = { error?: string; success?: string };

export async function createVideo(
  _state: VideoFormState | undefined,
  formData: FormData
): Promise<VideoFormState> {
  await requireAdmin();

  const lessonIdValue = String(formData.get("lessonId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const uploadedVideo = formData.get("video");
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const durationValue = String(formData.get("durationSeconds") ?? "0").trim();

  if (!/^\d+$/.test(lessonIdValue) || title.length < 2 || title.length > 255) {
    return { error: "Choose a lesson and enter a title between 2 and 255 characters." };
  }
  if (!(uploadedVideo instanceof File) && !isHttpUrl(videoUrl) || (thumbnailUrl && !isHttpUrl(thumbnailUrl))) {
    return { error: "Video and thumbnail URLs must use http or https." };
  }

  const durationSeconds = Number(durationValue);
  if (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 86400) {
    return { error: "Duration must be a whole number between 0 and 86400 seconds." };
  }

  let finalVideoUrl = videoUrl;
  let storageProvider = "external";
  if (uploadedVideo instanceof File) {
    try {
      const saved = await saveLocalUpload(uploadedVideo, ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE);
      finalVideoUrl = saved.url;
      storageProvider = "local";
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Upload failed." };
    }
  }

  const lessonId = BigInt(lessonIdValue);
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return { error: "The selected lesson does not exist." };

  await db.videos.create({
    data: {
      lesson_id: lessonId,
      title,
      video_url: finalVideoUrl,
      thumbnail_url: thumbnailUrl || null,
      duration_seconds: durationSeconds,
      storage_provider: storageProvider,
      published: false,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/videos");
  revalidatePath("/admin/lessons");
  return { success: "Video attached as a draft." };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
