import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const curriculum = [
  {
    title: "Web Foundations",
    lessons: ["How the web works", "Semantic HTML", "CSS layout and responsive design", "Accessibility fundamentals"],
  },
  {
    title: "JavaScript and TypeScript",
    lessons: ["Modern JavaScript syntax", "Async programming and APIs", "TypeScript types", "Type-safe project structure"],
  },
  {
    title: "React Essentials",
    lessons: ["Components and props", "State and events", "Forms and client interactions", "Reusable component design"],
  },
  {
    title: "Next.js Application Architecture",
    lessons: ["App Router fundamentals", "Server and Client Components", "Layouts and loading states", "Metadata and SEO"],
  },
  {
    title: "Data and PostgreSQL",
    lessons: ["Relational data modeling", "SQL queries and indexes", "Prisma Client", "Migrations and seed data"],
  },
  {
    title: "APIs and Server Actions",
    lessons: ["Route handlers", "Server Actions", "Validation and error handling", "API security basics"],
  },
  {
    title: "Authentication and Authorization",
    lessons: ["Password hashing", "Sessions and cookies", "Role-based access control", "Protecting application routes"],
  },
  {
    title: "File Uploads and Media",
    lessons: ["Upload architecture", "File type and size validation", "Object storage concepts", "Video and document delivery"],
  },
  {
    title: "Testing and Production Quality",
    lessons: ["Unit and integration tests", "End-to-end workflows", "Logging and observability", "Performance and security review"],
  },
  {
    title: "Deployment and Capstone",
    lessons: ["Environment configuration", "Production deployment", "Database backups and migrations", "Build a production-ready project"],
  },
];

try {
  const course = await db.course.findUnique({ where: { slug: "full-stack-web-development" }, select: { id: true, title: true } });
  if (!course) throw new Error("Full Stack course was not found.");

  for (const [moduleIndex, moduleData] of curriculum.entries()) {
    let curriculumModule = await db.module.findFirst({ where: { course_id: course.id, title: moduleData.title }, select: { id: true } });
    if (!curriculumModule) {
      curriculumModule = await db.module.create({ data: { course_id: course.id, title: moduleData.title, position: moduleIndex, published: true }, select: { id: true } });
    }

    for (const [lessonIndex, title] of moduleData.lessons.entries()) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await db.lesson.upsert({
        where: { module_id_slug: { module_id: curriculumModule.id, slug } },
        update: { title, position: lessonIndex, published: true },
        create: { module_id: curriculumModule.id, title, slug, position: lessonIndex, published: true },
      });
    }
  }

  console.log(`Seeded ${curriculum.length} published Full Stack modules for ${course.title}.`);
} finally {
  await db.$disconnect();
}
