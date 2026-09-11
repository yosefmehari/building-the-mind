import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

try {
  const lessons = await db.lesson.findMany({
    where: { quizzes: { none: {} } },
    select: { id: true, title: true },
  });

  for (const lesson of lessons) {
    await db.quiz.create({
      data: {
        lesson_id: lesson.id,
        title: `${lesson.title} Exam`,
        description: "Required exam for this lesson.",
        required: true,
        completion_scope: "lesson",
        published: false,
      },
    });
  }

  console.log(`Created ${lessons.length} required exam drafts.`);
} finally {
  await db.$disconnect();
}
