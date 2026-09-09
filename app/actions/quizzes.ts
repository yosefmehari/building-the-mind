"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type QuizFormState = { error?: string; success?: string };

export async function createQuiz(
  _state: QuizFormState | undefined,
  formData: FormData
): Promise<QuizFormState> {
  await requireAdmin();

  const lessonIdValue = String(formData.get("lessonId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!/^\d+$/.test(lessonIdValue) || title.length < 2 || title.length > 255) {
    return { error: "Choose a lesson and enter a title between 2 and 255 characters." };
  }

  const lessonId = BigInt(lessonIdValue);
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return { error: "The selected lesson does not exist." };

  await db.quiz.create({
    data: { lesson_id: lessonId, title, description: description || null, published: false },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/quizzes");
  return { success: "Quiz created as a draft." };
}
