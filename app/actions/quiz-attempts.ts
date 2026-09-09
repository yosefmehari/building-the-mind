"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export type QuizResult = { error?: string; score?: number; total?: number };

export async function submitQuiz(_state: QuizResult | undefined, formData: FormData): Promise<QuizResult> {
  const session = await getSession();
  if (!session?.userId) return { error: "Sign in to submit this quiz." };

  const quizIdValue = String(formData.get("quizId") ?? "");
  if (!/^\d+$/.test(quizIdValue)) return { error: "Invalid quiz." };

  const quizId = BigInt(quizIdValue);
  const quiz = await db.quiz.findFirst({
    where: { id: quizId, published: true },
    include: { questions: { include: { answers: true } } },
  });
  if (!quiz || quiz.questions.length === 0) return { error: "This quiz is not available yet." };

  const selectedAnswerIds = quiz.questions.map((question) => {
    const selected = String(formData.get(`question-${question.id.toString()}`) ?? "");
    return { question, selected };
  });
  if (selectedAnswerIds.some(({ selected }) => !/^\d+$/.test(selected))) {
    return { error: "Answer every question before submitting." };
  }

  const scoredAnswers = selectedAnswerIds.map(({ question, selected }) => {
    const answer = question.answers.find((candidate) => candidate.id.toString() === selected);
    return { question, answer, isCorrect: Boolean(answer?.is_correct) };
  });
  if (scoredAnswers.some(({ answer }) => !answer)) return { error: "One or more answers are invalid." };

  const score = scoredAnswers.filter(({ isCorrect }) => isCorrect).length;
  await db.$transaction(async (transaction) => {
    const attempt = await transaction.quizAttempt.create({
      data: { user_id: BigInt(session.userId), quiz_id: quizId, score, total_questions: quiz.questions.length },
      select: { id: true },
    });
    await transaction.quiz_attempt_answers.createMany({
      data: scoredAnswers.map(({ question, answer, isCorrect }) => ({
        attempt_id: attempt.id,
        question_id: question.id,
        answer_id: answer!.id,
        is_correct: isCorrect,
      })),
    });
  });

  return { score, total: quiz.questions.length };
}
