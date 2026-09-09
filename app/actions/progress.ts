"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonIdValue: string, courseSlug: string, lessonSlug: string) {
  const session = await getSession();
  if (!session?.userId) return { error: "Sign in to save your progress." };
  if (!/^\d+$/.test(lessonIdValue)) return { error: "Invalid lesson." };

  const lessonId = BigInt(lessonIdValue);
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return { error: "Lesson not found." };

  await db.student_progress.upsert({
    where: { user_id_lesson_id: { user_id: BigInt(session.userId), lesson_id: lessonId } },
    update: { completed: true, progress_percent: 100, completed_at: new Date(), updated_at: new Date() },
    create: { user_id: BigInt(session.userId), lesson_id: lessonId, completed: true, progress_percent: 100, completed_at: new Date() },
  });

  revalidatePath(`/courses/${courseSlug}/lessons/${lessonSlug}`);
  return { success: true };
}
