import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const courses = await db.course.findMany({
    where: { published: true },
    select: {
      slug: true,
      updated_at: true,
      levels: { select: { name: true } },
      modules: {
        select: {
          lessons: { where: { published: true }, select: { slug: true, updated_at: true } },
        },
      },
    },
  });

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/english`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const course of courses) {
    entries.push({ url: `${baseUrl}/courses/${course.slug}`, lastModified: course.updated_at, changeFrequency: "weekly", priority: 0.8 });
    if (course.levels) entries.push({ url: `${baseUrl}/english/${course.levels.name.toLowerCase()}`, lastModified: course.updated_at, changeFrequency: "weekly", priority: 0.8 });
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        entries.push({ url: `${baseUrl}/courses/${course.slug}/lessons/${lesson.slug}`, lastModified: lesson.updated_at, changeFrequency: "monthly", priority: 0.7 });
        if (course.levels) entries.push({ url: `${baseUrl}/english/${course.levels.name.toLowerCase()}/${lesson.slug}`, lastModified: lesson.updated_at, changeFrequency: "monthly", priority: 0.7 });
      }
    }
  }

  return entries;
}
