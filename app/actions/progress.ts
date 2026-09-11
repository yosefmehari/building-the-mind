"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonIdValue: string, courseSlug: string, lessonSlug: string) {
  const session = await getSession();
  if (!session?.userId) return { error: "Sign in to save your progress." };
  if (!/^\d+$/.test(lessonIdValue)) return { error: "Invalid lesson." };

  const lessonId = BigInt(lessonIdValue);
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      modules: {
        include: {
          courses: { select: { id: true } },
          lessons: { where: { published: true }, select: { id: true, position: true } },
        },
      },
    },
  });
  if (!lesson) return { error: "Lesson not found." };

  const courseModules = await db.module.findMany({
    where: { course_id: lesson.modules.courses.id, published: true },
    select: { id: true, position: true, lessons: { where: { published: true }, select: { id: true, position: true } } },
  });
  const moduleLessons = lesson.modules.lessons;
  const isCurrentModuleFinal = moduleLessons.every((item) => item.id !== lesson.id || item.position <= lesson.position);
  const isCourseFinalLesson = isCurrentModuleFinal && courseModules.every((module) => module.id === lesson.modules.id || module.position <= lesson.modules.position);

  const requiredQuizzes = await db.quiz.findMany({
    where: {
      required: true,
      published: true,
      OR: [
        { lesson_id: lessonId, completion_scope: "lesson" },
        ...(isCurrentModuleFinal ? [{ completion_scope: "module", lessons: { module_id: lesson.modules.id } }] : []),
        ...(isCourseFinalLesson ? [{ completion_scope: "course", lessons: { modules: { course_id: lesson.modules.courses.id } } }] : []),
      ],
    },
    select: { id: true, title: true },
  });

  if (requiredQuizzes.length > 0) {
    const completedExams = await db.quizAttempt.findMany({
      where: { user_id: BigInt(session.userId), quiz_id: { in: requiredQuizzes.map((quiz) => quiz.id) } },
      select: { quiz_id: true },
      distinct: ["quiz_id"],
    });
    const completedIds = new Set(completedExams.map((attempt) => attempt.quiz_id.toString()));
    const missing = requiredQuizzes.filter((quiz) => !completedIds.has(quiz.id.toString()));
    if (missing.length > 0) {
      return { error: `Complete the required exam before finishing this ${missing.length === 1 ? "lesson" : "section"}: ${missing[0].title}.` };
    }
  }

  await db.student_progress.upsert({
    where: { user_id_lesson_id: { user_id: BigInt(session.userId), lesson_id: lessonId } },
    update: { completed: true, progress_percent: 100, completed_at: new Date(), updated_at: new Date() },
    create: { user_id: BigInt(session.userId), lesson_id: lessonId, completed: true, progress_percent: 100, completed_at: new Date() },
  });

  revalidatePath(`/courses/${courseSlug}/lessons/${lessonSlug}`);
  return { success: true };
}
