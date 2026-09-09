"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type QuestionFormState = { error?: string; success?: string };

export async function createQuestion(
  _state: QuestionFormState | undefined,
  formData: FormData
): Promise<QuestionFormState> {
  await requireAdmin();

  const quizIdValue = String(formData.get("quizId") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answers = formData
    .getAll("answers")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const correctIndexValue = String(formData.get("correctIndex") ?? "");

  if (!/^\d+$/.test(quizIdValue) || question.length < 5) {
    return { error: "Choose a quiz and enter a question of at least 5 characters." };
  }
  if (answers.length < 2 || answers.length > 6) {
    return { error: "Add between 2 and 6 answer options." };
  }

  const correctIndex = Number(correctIndexValue);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= answers.length) {
    return { error: "Choose exactly one correct answer." };
  }

  const quizId = BigInt(quizIdValue);
  const quiz = await db.quiz.findUnique({ where: { id: quizId }, select: { id: true } });
  if (!quiz) return { error: "The selected quiz does not exist." };

  const lastQuestion = await db.question.findFirst({
    where: { quiz_id: quizId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (lastQuestion?.position ?? -1) + 1;

  await db.$transaction(async (transaction) => {
    const createdQuestion = await transaction.question.create({
      data: { quiz_id: quizId, question, position },
      select: { id: true },
    });

    await transaction.answers.createMany({
      data: answers.map((answer, index) => ({
        question_id: createdQuestion.id,
        answer,
        is_correct: index === correctIndex,
      })),
    });
  });

  revalidatePath(`/admin/quizzes/${quizIdValue}/questions`);
  revalidatePath("/admin/quizzes");
  return { success: "Question added to the quiz." };
}
