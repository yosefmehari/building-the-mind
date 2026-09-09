"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { saveLocalUpload } from "@/lib/storage/local";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type FileFormState = { error?: string; success?: string };

export async function createLessonFile(
  _state: FileFormState | undefined,
  formData: FormData
): Promise<FileFormState> {
  await requireAdmin();

  const lessonIdValue = String(formData.get("lessonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const uploadedFile = formData.get("file");
  const fileType = String(formData.get("fileType") ?? "");
  const fileSizeValue = String(formData.get("fileSize") ?? "0").trim();

  if (!/^\d+$/.test(lessonIdValue) || name.length < 1 || name.length > 255) {
    return { error: "Choose a lesson and enter a valid file name." };
  }
  if (uploadedFile instanceof File) {
    try {
      const saved = await saveLocalUpload(uploadedFile, ALLOWED_TYPES, MAX_FILE_SIZE);
      return await persistFile(lessonIdValue, name, saved.url, saved.mimeType, saved.size);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Upload failed." };
    }
  }
  if (!isHttpUrl(fileUrl)) return { error: "Provide a hosted URL or upload a file." };
  if (!ALLOWED_TYPES.has(fileType)) return { error: "This file type is not supported." };

  const fileSize = Number(fileSizeValue);
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    return { error: "File size must be between 1 byte and 50 MB." };
  }

  return persistFile(lessonIdValue, name, fileUrl, fileType, fileSize);
}

async function persistFile(lessonIdValue: string, name: string, fileUrl: string, fileType: string, fileSize: number) {
  const lessonId = BigInt(lessonIdValue);
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return { error: "The selected lesson does not exist." };

  await db.lesson_files.create({
    data: {
      lesson_id: lessonId,
      name,
      file_url: fileUrl,
      file_type: fileType,
      file_size: BigInt(fileSize),
      storage_provider: "external",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/files");
  revalidatePath("/admin/lessons");
  return { success: "File attached successfully." };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
