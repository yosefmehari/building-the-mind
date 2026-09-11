import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ level: string; lessonSlug: string }>;
}

export default async function EnglishLessonRoute({ params }: Props) {
  const { level, lessonSlug } = await params;
  const levelRecord = await db.levels.findFirst({ where: { name: level.toUpperCase() }, select: { id: true } });
  if (!levelRecord) notFound();

  const lesson = await db.lesson.findFirst({
    where: {
      slug: lessonSlug,
      published: true,
      modules: { courses: { level_id: levelRecord.id } },
    },
    select: { slug: true, modules: { select: { courses: { select: { slug: true } } } } },
  });
  if (!lesson) notFound();

  redirect(`/courses/${lesson.modules.courses.slug}/lessons/${lesson.slug}`);
}
